<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import archivedNotesData from '../notes/archived.json'

type NoteType = 'question' | 'important' | 'thought' | 'verify'
type LearningNote = {
  id: string
  page: string
  pageTitle: string
  quote: string
  prefix: string
  suffix: string
  blockText?: string
  note: string
  type: NoteType
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'learn-hub:learning-notes:v1'
const DELETED_STORAGE_KEY = 'learn-hub:deleted-note-ids:v1'
const localNotes = ref<LearningNote[]>([])
const deletedIds = ref<string[]>([])
const query = ref('')
const typeFilter = ref<'all' | NoteType>('all')
const statusFilter = ref<'all' | 'local' | 'archived'>('all')
const archiveMessage = ref('')
const isArchiving = ref(false)
const editingId = ref<string | null>(null)
const editingType = ref<NoteType>('question')
const editingText = ref('')
const archivedNotes = archivedNotesData as LearningNote[]
const archivedIds = new Set(archivedNotes.map((note) => note.id))
const isLocalDev = import.meta.env.DEV
const typeLabels: Record<NoteType, string> = {
  question: '疑问',
  important: '重点',
  thought: '心得',
  verify: '待验证'
}

const allNotes = computed(() => {
  const deleted = new Set(deletedIds.value)
  const notes = new Map(archivedNotes.filter((note) => !deleted.has(note.id)).map((note) => [note.id, note]))
  for (const note of localNotes.value) notes.set(note.id, note)
  return [...notes.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
})

const filteredNotes = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase()
  return allNotes.value.filter((note) => {
    if (typeFilter.value !== 'all' && note.type !== typeFilter.value) return false
    const isPending = localNotes.value.some((item) => item.id === note.id)
    if (statusFilter.value === 'local' && !isPending) return false
    if (statusFilter.value === 'archived' && isPending) return false
    if (!keyword) return true
    return [note.pageTitle, note.quote, note.note, typeLabels[note.type]]
      .some((value) => value.toLocaleLowerCase().includes(keyword))
  })
})

const pendingNotes = computed(() => localNotes.value)
const pendingOperationCount = computed(() => pendingNotes.value.length + deletedIds.value.length)

function loadNotes() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    localNotes.value = Array.isArray(stored) ? stored : []
  } catch {
    localNotes.value = []
  }
  try {
    const storedDeletedIds = JSON.parse(localStorage.getItem(DELETED_STORAGE_KEY) || '[]')
    deletedIds.value = Array.isArray(storedDeletedIds) ? storedDeletedIds : []
  } catch {
    deletedIds.value = []
  }
}

function persistNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localNotes.value))
  localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedIds.value))
  window.dispatchEvent(new CustomEvent('learn-hub-notes-updated'))
}

function noteStatus(note: LearningNote) {
  if (localNotes.value.some((item) => item.id === note.id)) {
    return archivedIds.has(note.id) ? '待重新归档' : '本地草稿'
  }
  return '已归档'
}

function startEditing(note: LearningNote) {
  editingId.value = note.id
  editingType.value = note.type
  editingText.value = note.note
}

function cancelEditing() {
  editingId.value = null
  editingText.value = ''
}

function saveEditing(note: LearningNote) {
  const text = editingText.value.trim()
  if (!text) return
  const updated = { ...note, type: editingType.value, note: text, updatedAt: new Date().toISOString() }
  localNotes.value = [...localNotes.value.filter((item) => item.id !== note.id), updated]
  deletedIds.value = deletedIds.value.filter((id) => id !== note.id)
  persistNotes()
  cancelEditing()
  archiveMessage.value = archivedIds.has(note.id) ? '修改已保存到本地，重新归档后网站内容才会更新。' : '修改已保存。'
}

function deleteNote(note: LearningNote) {
  if (!window.confirm('确定删除这条便签吗？')) return
  const wasArchived = archivedIds.has(note.id)
  localNotes.value = localNotes.value.filter((item) => item.id !== note.id)
  if (wasArchived && !deletedIds.value.includes(note.id)) deletedIds.value.push(note.id)
  persistNotes()
  if (editingId.value === note.id) cancelEditing()
  archiveMessage.value = wasArchived ? '已标记为待删除，重新归档后才会从网站移除。' : '本地便签已删除。'
}

function normalizePagePath(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  let normalized = path.split('#')[0].split('?')[0]
  if (base && normalized === base) normalized = '/'
  else if (base && normalized.startsWith(`${base}/`)) normalized = normalized.slice(base.length)
  if (!normalized.startsWith('/')) normalized = `/${normalized}`
  return normalized || '/'
}

function jumpToNote(note: LearningNote) {
  window.location.href = `${withBase(normalizePagePath(note.page))}#learning-note=${encodeURIComponent(note.id)}`
}

function exportPendingNotes() {
  if (!pendingOperationCount.value) return
  const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), notes: pendingNotes.value, deletedIds: deletedIds.value }, null, 2)
  const url = URL.createObjectURL(new Blob([`${payload}\n`], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `learn-hub-notes-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  archiveMessage.value = `已导出 ${pendingOperationCount.value} 项待归档改动。`
}

async function archivePendingNotes() {
  if (!isLocalDev || !pendingOperationCount.value) return
  isArchiving.value = true
  archiveMessage.value = ''
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}__learn-hub/archive-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: pendingNotes.value.map((note) => ({ ...note, page: normalizePagePath(note.page) })),
        deletedIds: deletedIds.value
      })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || '归档失败。')
    const ids = new Set<string>(result.archivedIds)
    localNotes.value = localNotes.value.filter((note) => !ids.has(note.id))
    deletedIds.value = deletedIds.value.filter((id) => !result.deletedIds.includes(id))
    persistNotes()
    archiveMessage.value = `已写入仓库数据文件，共 ${ids.size} 条；检查 Git 变更后即可提交。`
  } catch (error) {
    archiveMessage.value = error instanceof Error ? error.message : '归档失败。'
  } finally {
    isArchiving.value = false
  }
}

onMounted(() => {
  loadNotes()
  window.addEventListener('storage', loadNotes)
  window.addEventListener('learn-hub-notes-updated', loadNotes)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', loadNotes)
  window.removeEventListener('learn-hub-notes-updated', loadNotes)
})
</script>

<template>
  <div class="all-learning-notes">
    <div class="all-learning-notes-heading">
      <div>
        <h1>我的便签</h1>
        <p>集中查看、搜索并回到所有学习便签对应的原文位置。</p>
      </div>
      <div class="all-learning-notes-archive">
        <span>{{ pendingOperationCount }} 项待归档改动</span>
        <div class="all-learning-notes-archive-actions">
          <button type="button" :disabled="!pendingOperationCount" @click="exportPendingNotes">导出</button>
          <button v-if="isLocalDev" type="button" class="primary" :disabled="!pendingOperationCount || isArchiving" @click="archivePendingNotes">
            {{ isArchiving ? '归档中…' : '一键归档' }}
          </button>
        </div>
      </div>
      <p v-if="archiveMessage" class="all-learning-notes-archive-message">{{ archiveMessage }}</p>
    </div>

    <div class="all-learning-notes-toolbar">
      <label class="all-learning-notes-search">
        <span class="sr-only">搜索便签</span>
        <input v-model="query" type="search" placeholder="搜索原文、便签内容或页面标题…">
      </label>
      <label>
        <span>类型</span>
        <select v-model="typeFilter">
          <option value="all">全部</option>
          <option value="question">疑问</option>
          <option value="important">重点</option>
          <option value="thought">心得</option>
          <option value="verify">待验证</option>
        </select>
      </label>
      <label>
        <span>状态</span>
        <select v-model="statusFilter">
          <option value="all">全部</option>
          <option value="local">本地草稿</option>
          <option value="archived">已归档</option>
        </select>
      </label>
    </div>

    <p class="all-learning-notes-summary">共 {{ allNotes.length }} 条，当前显示 {{ filteredNotes.length }} 条</p>
    <p v-if="!filteredNotes.length" class="all-learning-notes-empty">没有找到符合条件的便签。</p>

    <article v-for="note in filteredNotes" :key="note.id" class="all-learning-note-item">
      <div class="all-learning-note-meta">
        <span class="learning-note-type" :class="`is-${note.type}`">{{ typeLabels[note.type] }}</span>
        <small>{{ noteStatus(note) }}</small>
      </div>
      <button v-if="editingId !== note.id" type="button" @click="jumpToNote(note)">
        <strong>{{ note.pageTitle }}</strong>
        <blockquote>“{{ note.quote }}”</blockquote>
        <p>{{ note.note }}</p>
        <small>{{ new Date(note.updatedAt).toLocaleString('zh-CN') }} · 回到原文 →</small>
      </button>
      <div v-else class="all-learning-note-editor">
        <label>类型
          <select v-model="editingType">
            <option value="question">疑问</option>
            <option value="important">重点</option>
            <option value="thought">心得</option>
            <option value="verify">待验证</option>
          </select>
        </label>
        <label>便签内容
          <textarea v-model="editingText" rows="4" />
        </label>
        <div>
          <button type="button" @click="cancelEditing">取消</button>
          <button type="button" class="primary" :disabled="!editingText.trim()" @click="saveEditing(note)">保存修改</button>
        </div>
      </div>
      <div v-if="editingId !== note.id" class="all-learning-note-actions">
        <button type="button" @click="startEditing(note)">编辑</button>
        <button type="button" @click="deleteNote(note)">删除</button>
      </div>
    </article>
  </div>
</template>

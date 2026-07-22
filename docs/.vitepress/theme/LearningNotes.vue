<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
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

type SearchCharacter = { node: Text; offset: number }
type NoteMarkerPosition = { id: string; left: number; top: number; visible: boolean }

const STORAGE_KEY = 'learn-hub:learning-notes:v1'
const DELETED_STORAGE_KEY = 'learn-hub:deleted-note-ids:v1'
const route = useRoute()
const { frontmatter } = useData()
const localNotes = ref<LearningNote[]>([])
const deletedIds = ref<string[]>([])
const orderedPageNotes = ref<LearningNote[]>([])
const expandedNoteId = ref<string | null>(null)
const isPanelOpen = ref(false)
const isComposerOpen = ref(false)
const selectedTab = ref<'page' | 'all'>('page')
const selectedQuote = ref('')
const selectedPrefix = ref('')
const selectedSuffix = ref('')
const selectedBlockText = ref('')
const noteType = ref<NoteType>('question')
const noteText = ref('')
const editingId = ref<string | null>(null)
const selectionButton = ref({ visible: false, left: 0, top: 0 })
const markerPositions = ref<NoteMarkerPosition[]>([])
let markerFrame = 0

const archivedNotes = archivedNotesData as LearningNote[]
const archivedIds = computed(() => new Set(archivedNotes.map((note) => note.id)))
const allNotes = computed(() => {
  const deleted = new Set(deletedIds.value)
  const notes = new Map(archivedNotes.filter((note) => !deleted.has(note.id)).map((note) => [note.id, note]))
  for (const note of localNotes.value) notes.set(note.id, note)
  return [...notes.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
})
const pageNotes = computed(() => allNotes.value.filter((note) => normalizePagePath(note.page) === normalizePagePath(route.path)))
const displayedPageNotes = computed(() => orderedPageNotes.value.length ? orderedPageNotes.value : pageNotes.value)
const expandedNote = computed(() => allNotes.value.find((note) => note.id === expandedNoteId.value) || null)
const expandedMarker = computed(() => markerPositions.value.find((marker) => marker.id === expandedNoteId.value) || null)
const expandedCardStyle = computed(() => {
  const marker = expandedMarker.value
  if (!marker || typeof window === 'undefined') return {}
  const preferredWidth = Math.min(340, window.innerWidth - 24)
  const markerElement = document.querySelector<HTMLElement>(`[data-learning-note-marker="${marker.id}"]`)
  const markerRect = markerElement?.getBoundingClientRect()
  const markerRight = markerRect?.right ?? marker.left + 30
  const rightAvailable = window.innerWidth - markerRight - 12
  const canOpenRight = rightAvailable >= 240
  const width = canOpenRight ? Math.min(preferredWidth, rightAvailable) : preferredWidth
  return {
    width: `${width}px`,
    left: `${canOpenRight ? markerRight + 12 : Math.max(12, marker.left - width - 12)}px`,
    top: `${Math.min(Math.max(72, marker.top - 8), Math.max(72, window.innerHeight - 420))}px`
  }
})
const visibleNotes = computed(() => selectedTab.value === 'page' ? pageNotes.value : allNotes.value)
const pendingNotes = computed(() => localNotes.value.filter((note) => !archivedIds.value.has(note.id)))

const typeLabels: Record<NoteType, string> = {
  question: '疑问',
  important: '重点',
  thought: '心得',
  verify: '待验证'
}

function loadLocalNotes() {
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

function persistLocalNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localNotes.value))
  localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedIds.value))
  window.dispatchEvent(new CustomEvent('learn-hub-notes-updated'))
}

function pageTitle() {
  return frontmatter.value.title || document.querySelector('.vp-doc h1')?.textContent?.trim() || document.title
}

function normalizePagePath(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  let normalized = path.split('#')[0].split('?')[0]
  if (base && normalized === base) normalized = '/'
  else if (base && normalized.startsWith(`${base}/`)) normalized = normalized.slice(base.length)
  if (!normalized.startsWith('/')) normalized = `/${normalized}`
  return normalized || '/'
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `note-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function openComposer() {
  editingId.value = null
  noteType.value = 'question'
  noteText.value = ''
  isComposerOpen.value = true
  isPanelOpen.value = true
  selectionButton.value.visible = false
  nextTick(() => document.querySelector<HTMLTextAreaElement>('.learning-note-textarea')?.focus())
}

function saveNote() {
  const text = noteText.value.trim()
  if (!text || !selectedQuote.value) return
  const now = new Date().toISOString()

  if (editingId.value) {
    const existing = allNotes.value.find((note) => note.id === editingId.value)
    if (!existing) return
    const updated = { ...existing, note: text, type: noteType.value, updatedAt: now }
    localNotes.value = [...localNotes.value.filter((note) => note.id !== updated.id), updated]
  } else {
    localNotes.value.push({
      id: makeId(),
      page: normalizePagePath(route.path),
      pageTitle: pageTitle(),
      quote: selectedQuote.value,
      prefix: selectedPrefix.value,
      suffix: selectedSuffix.value,
      blockText: selectedBlockText.value,
      note: text,
      type: noteType.value,
      createdAt: now,
      updatedAt: now
    })
  }

  persistLocalNotes()
  closeComposer()
  isPanelOpen.value = false
  renderHighlights()
}

function editNote(note: LearningNote) {
  editingId.value = note.id
  selectedQuote.value = note.quote
  selectedPrefix.value = note.prefix
  selectedSuffix.value = note.suffix
  selectedBlockText.value = note.blockText || ''
  noteType.value = note.type
  noteText.value = note.note
  isComposerOpen.value = true
  isPanelOpen.value = true
  nextTick(() => document.querySelector<HTMLTextAreaElement>('.learning-note-textarea')?.focus())
}

function deleteNote(note: LearningNote) {
  if (!window.confirm('确定删除这条便签吗？')) return
  const wasArchived = archivedIds.value.has(note.id)
  localNotes.value = localNotes.value.filter((item) => item.id !== note.id)
  if (wasArchived && !deletedIds.value.includes(note.id)) deletedIds.value.push(note.id)
  persistLocalNotes()
  closeComposer()
  isPanelOpen.value = false
  renderHighlights()
}

function closeComposer() {
  isComposerOpen.value = false
  editingId.value = null
  noteText.value = ''
  window.getSelection()?.removeAllRanges()
}

function getArticleTextContext(range: Range) {
  const container = document.querySelector('.vp-doc')
  if (!container) return { prefix: '', suffix: '' }
  const before = document.createRange()
  before.selectNodeContents(container)
  before.setEnd(range.startContainer, range.startOffset)
  const after = document.createRange()
  after.selectNodeContents(container)
  after.setStart(range.endContainer, range.endOffset)
  return {
    prefix: before.toString().slice(-48),
    suffix: after.toString().slice(0, 48)
  }
}

function handleSelection() {
  if (isComposerOpen.value) return
  const selection = window.getSelection()
  const article = document.querySelector('.vp-doc')
  if (!selection || selection.isCollapsed || !selection.rangeCount || !article?.contains(selection.anchorNode)) {
    selectionButton.value.visible = false
    return
  }
  const range = selection.getRangeAt(0)
  const quote = selection.toString().trim()
  if (!quote || quote.length > 1000) return
  const rect = range.getBoundingClientRect()
  const context = getArticleTextContext(range)
  const startElement = range.startContainer.nodeType === Node.TEXT_NODE
    ? range.startContainer.parentElement
    : range.startContainer as Element
  const block = startElement?.closest('p, li, blockquote, h1, h2, h3, h4, h5, h6, td, th')
  selectedQuote.value = quote
  selectedPrefix.value = context.prefix
  selectedSuffix.value = context.suffix
  selectedBlockText.value = block?.textContent?.replace(/\s+/g, ' ').trim() || ''
  selectionButton.value = {
    visible: true,
    left: Math.min(window.innerWidth - 132, Math.max(8, rect.left + rect.width / 2 - 58)),
    top: Math.max(8, rect.bottom + 8)
  }
}

function searchableText(root: Element) {
  const characters: SearchCharacter[] = []
  let text = ''
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!node.textContent || !parent || parent.closest('pre, code, button, input, textarea, select, .learning-notes-ui')) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    }
  })
  let previousBlock: Element | null = null
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    const value = node.textContent || ''
    const block = node.parentElement?.closest('p, li, blockquote, h1, h2, h3, h4, h5, h6, td, th, pre') || null
    if (previousBlock && block !== previousBlock && text && !text.endsWith(' ')) {
      text += ' '
      characters.push({ node, offset: 0 })
    }
    for (let offset = 0; offset < value.length; offset += 1) {
      const character = value[offset]
      if (/\s/.test(character)) {
        if (text && !text.endsWith(' ')) {
          text += ' '
          characters.push({ node, offset })
        }
      } else {
        text += character
        characters.push({ node, offset })
      }
    }
    previousBlock = block
  }
  return { text, characters }
}

function locateNote(note: LearningNote) {
  const root = document.querySelector('.vp-doc')
  if (!root) return null
  const { text, characters } = searchableText(root)
  const quote = note.quote.replace(/\s+/g, ' ').trim()
  const prefixContext = note.prefix.replace(/\s+/g, ' ').trim()
  const suffixContext = note.suffix.replace(/\s+/g, ' ').trim()
  if (!quote) return null
  const candidates: number[] = []
  let index = text.indexOf(quote)
  while (index >= 0) {
    candidates.push(index)
    index = text.indexOf(quote, index + 1)
  }
  if (!candidates.length) return null
  const best = candidates.sort((a, b) => {
    const score = (start: number) => {
      const prefix = text.slice(Math.max(0, start - prefixContext.length), start)
      const suffix = text.slice(start + quote.length, start + quote.length + suffixContext.length)
      return commonTail(prefix, prefixContext) + commonHead(suffix, suffixContext)
    }
    return score(b) - score(a)
  })[0]
  const startCharacter = characters[best]
  const endCharacter = characters[best + quote.length - 1]
  if (!startCharacter || !endCharacter) return null
  const range = document.createRange()
  range.setStart(startCharacter.node, startCharacter.offset)
  range.setEnd(endCharacter.node, endCharacter.offset + 1)
  return range
}

function commonHead(a: string, b: string) {
  let count = 0
  while (count < a.length && count < b.length && a[count] === b[count]) count += 1
  return count
}

function commonTail(a: string, b: string) {
  let count = 0
  while (count < a.length && count < b.length && a[a.length - 1 - count] === b[b.length - 1 - count]) count += 1
  return count
}

function clearHighlights() {
  const marks = [...document.querySelectorAll<HTMLElement>('.vp-doc mark.learning-note-highlight')]
  const parents = new Set<Node>()
  for (const mark of marks) {
    parents.add(mark.parentNode as Node)
    mark.replaceWith(document.createTextNode(mark.textContent || ''))
  }
  parents.forEach((parent) => parent.normalize())
}

function wrapRange(range: Range, noteId: string) {
  const root = document.querySelector('.vp-doc')
  if (!root) return
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    if (range.intersectsNode(node)) nodes.push(node)
  }
  for (const textNode of nodes.reverse()) {
    const length = textNode.textContent?.length || 0
    const start = textNode === range.startContainer ? range.startOffset : 0
    const end = textNode === range.endContainer ? range.endOffset : length
    if (start >= end) continue
    const existing = textNode.parentElement?.closest<HTMLElement>('mark.learning-note-highlight')
    if (existing) {
      const ids = new Set((existing.dataset.noteIds || '').split(',').filter(Boolean))
      ids.add(noteId)
      existing.dataset.noteIds = [...ids].join(',')
      continue
    }
    if (end < length) textNode.splitText(end)
    const selected = start > 0 ? textNode.splitText(start) : textNode
    const mark = document.createElement('mark')
    mark.className = 'learning-note-highlight'
    mark.dataset.noteIds = noteId
    selected.parentNode?.insertBefore(mark, selected)
    mark.appendChild(selected)
  }
}

function updateActiveSourceHighlight() {
  const activeId = expandedNoteId.value
  document.querySelectorAll<HTMLElement>('.vp-doc mark.learning-note-highlight').forEach((mark) => {
    const ids = (mark.dataset.noteIds || '').split(',').filter(Boolean)
    mark.classList.toggle('is-active', Boolean(activeId && ids.includes(activeId)))
  })
}

function renderHighlights() {
  clearHighlights()
  const located = pageNotes.value.map((note) => ({ note, range: locateNote(note) }))
  located.sort((a, b) => {
    if (!a.range && !b.range) return b.note.updatedAt.localeCompare(a.note.updatedAt)
    if (!a.range) return 1
    if (!b.range) return -1
    return a.range.compareBoundaryPoints(Range.START_TO_START, b.range)
  })
  orderedPageNotes.value = located.map(({ note }) => note)
  for (const note of orderedPageNotes.value) {
    const range = locateNote(note)
    if (range) wrapRange(range, note.id)
  }
  updateActiveSourceHighlight()
  nextTick(updateMarkerPositions)
}

function jumpToNote(note: LearningNote) {
  const focus = (attempt = 0) => nextTick(() => {
    const range = locateNote(note)
    if (!range && attempt < 8) {
      window.setTimeout(() => focus(attempt + 1), 140)
      return
    }
    const element = range?.startContainer.parentElement
    const firstLine = range?.getClientRects()[0]
    if (firstLine) {
      window.scrollTo({
        top: Math.max(0, window.scrollY + firstLine.top - window.innerHeight / 2 + firstLine.height / 2),
        behavior: 'smooth'
      })
    } else {
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
  isPanelOpen.value = false
  if (normalizePagePath(route.path) === normalizePagePath(note.page)) focus()
  else window.location.href = `${withBase(normalizePagePath(note.page))}#learning-note=${encodeURIComponent(note.id)}`
}

function togglePageNote(note: LearningNote) {
  if (expandedNoteId.value === note.id) {
    expandedNoteId.value = null
    updateActiveSourceHighlight()
    updateMarkerPositions()
    return
  }
  expandedNoteId.value = note.id
  updateActiveSourceHighlight()
  updateMarkerPositions()
  jumpToNote(note)
}

function markerStyle(noteId: string) {
  const marker = markerPositions.value.find((item) => item.id === noteId)
  if (!marker) return { display: 'none' }
  return {
    left: `${marker.left}px`,
    top: `${marker.top}px`,
    visibility: marker.visible ? 'visible' : 'hidden'
  }
}

function updateMarkerPositions() {
  if (markerFrame) cancelAnimationFrame(markerFrame)
  markerFrame = requestAnimationFrame(() => {
    markerFrame = 0
    const article = document.querySelector('.vp-doc')
    if (!article) {
      markerPositions.value = []
      return
    }
    const articleRect = article.getBoundingClientRect()
    const marks = [...article.querySelectorAll<HTMLElement>('mark.learning-note-highlight')]
    const raw = displayedPageNotes.value.map((note) => {
      const mark = marks.find((item) => (item.dataset.noteIds || '').split(',').includes(note.id))
      const rect = mark?.getBoundingClientRect()
      return {
        id: note.id,
        left: Math.min(articleRect.right + 10, window.innerWidth - 48),
        top: rect?.top ?? -100,
        visible: Boolean(rect && rect.bottom > 64 && rect.top < window.innerHeight - 36)
      }
    }).sort((a, b) => a.top - b.top)

    let previousTop = 54
    for (const marker of raw) {
      if (!marker.visible) continue
      marker.top = Math.max(marker.top, previousTop + 30)
      previousTop = marker.top
    }
    markerPositions.value = raw
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    selectionButton.value.visible = false
    if (isComposerOpen.value) closeComposer()
    else isPanelOpen.value = false
  }
}

onMounted(() => {
  loadLocalNotes()
  document.addEventListener('selectionchange', handleSelection)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', updateMarkerPositions, { passive: true })
  window.addEventListener('resize', updateMarkerPositions)
  nextTick(() => {
    renderHighlights()
    const noteId = new URLSearchParams(window.location.hash.split('?')[1] || window.location.hash.replace(/^#/, '')).get('learning-note')
    const note = allNotes.value.find((item) => item.id === noteId)
    if (note) {
      expandedNoteId.value = note.id
      updateActiveSourceHighlight()
      jumpToNote(note)
    }
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', handleSelection)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', updateMarkerPositions)
  window.removeEventListener('resize', updateMarkerPositions)
  clearHighlights()
  if (markerFrame) cancelAnimationFrame(markerFrame)
})

watch(() => route.path, async () => {
  selectionButton.value.visible = false
  isComposerOpen.value = false
  orderedPageNotes.value = []
  expandedNoteId.value = null
  markerPositions.value = []
  await nextTick()
  renderHighlights()
})

watch(pageNotes, () => nextTick(renderHighlights), { deep: true })
</script>

<template>
  <div class="learning-notes-ui">
    <Teleport to="body">
      <button
        v-for="note in displayedPageNotes"
        :key="note.id"
        type="button"
        class="learning-margin-note-marker"
        :data-learning-note-marker="note.id"
        :class="[`is-${note.type}`, { 'is-active': expandedNoteId === note.id }]"
        :style="markerStyle(note.id)"
        :aria-label="`${typeLabels[note.type]}便签：${note.note}`"
        :aria-expanded="expandedNoteId === note.id"
        @click="togglePageNote(note)"
      >
        <span aria-hidden="true">●</span><span class="learning-margin-note-label">{{ typeLabels[note.type] }}</span>
      </button>

      <aside
        v-if="expandedNote && expandedMarker"
        class="learning-margin-note-card"
        :style="expandedCardStyle"
        aria-label="当前便签"
      >
        <header>
          <span class="learning-note-type" :class="`is-${expandedNote.type}`">{{ typeLabels[expandedNote.type] }}</span>
          <small>{{ localNotes.some((item) => item.id === expandedNote.id) && archivedIds.has(expandedNote.id) ? '待重新归档' : archivedIds.has(expandedNote.id) ? '已归档' : '本地草稿' }}</small>
          <button type="button" aria-label="收起便签" @click="togglePageNote(expandedNote)">×</button>
        </header>
        <p>{{ expandedNote.note }}</p>
        <footer>
          <a :href="withBase('/annotations/')">查看全部便签</a>
          <span>
            <button type="button" @click="editNote(expandedNote)">编辑</button>
            <button type="button" @click="deleteNote(expandedNote)">删除</button>
          </span>
        </footer>
      </aside>
    </Teleport>

    <button
      v-if="selectionButton.visible"
      type="button"
      class="learning-note-selection-button"
      :style="{ left: `${selectionButton.left}px`, top: `${selectionButton.top}px` }"
      @mousedown.prevent
      @click="openComposer"
    >
      ＋ 添加便签
    </button>

    <Teleport to="body">
      <div v-if="isPanelOpen" class="learning-notes-backdrop" @click.self="isPanelOpen = false">
        <aside class="learning-notes-panel" role="dialog" aria-modal="true" aria-label="我的便签">
          <header class="learning-notes-header">
            <div>
              <strong>我的便签</strong>
              <small>{{ pendingNotes.length }} 条待归档</small>
            </div>
            <button type="button" aria-label="关闭便签" @click="isPanelOpen = false">×</button>
          </header>

          <div class="learning-notes-tabs">
            <button type="button" :class="{ active: selectedTab === 'page' }" @click="selectedTab = 'page'">本页 {{ pageNotes.length }}</button>
            <button type="button" :class="{ active: selectedTab === 'all' }" @click="selectedTab = 'all'">全部 {{ allNotes.length }}</button>
          </div>

          <div v-if="isComposerOpen" class="learning-note-composer">
            <blockquote>“{{ selectedQuote }}”</blockquote>
            <label>类型
              <select v-model="noteType">
                <option value="question">疑问</option>
                <option value="important">重点</option>
                <option value="thought">心得</option>
                <option value="verify">待验证</option>
              </select>
            </label>
            <label>便签内容
              <textarea v-model="noteText" class="learning-note-textarea" rows="5" placeholder="记录你的想法、疑问或待验证内容……" />
            </label>
            <div class="learning-note-actions">
              <button type="button" @click="closeComposer">取消</button>
              <button type="button" class="primary" :disabled="!noteText.trim()" @click="saveNote">{{ editingId ? '保存修改' : '保存为本地草稿' }}</button>
            </div>
          </div>

          <div v-else class="learning-notes-list">
            <p v-if="!visibleNotes.length" class="learning-notes-empty">{{ selectedTab === 'page' ? '本页还没有便签。选中正文即可添加。' : '还没有便签。' }}</p>
            <article v-for="note in visibleNotes" :key="note.id" class="learning-note-card">
              <div class="learning-note-meta">
                <span class="learning-note-type" :class="`is-${note.type}`">{{ typeLabels[note.type] }}</span>
                <small>{{ archivedIds.has(note.id) ? '已归档' : '本地草稿' }}</small>
              </div>
              <button class="learning-note-link" type="button" @click="jumpToNote(note)">
                <strong v-if="selectedTab === 'all'">{{ note.pageTitle }}</strong>
                <blockquote>“{{ note.quote }}”</blockquote>
                <p>{{ note.note }}</p>
              </button>
              <div class="learning-note-card-actions">
                <button type="button" @click="editNote(note)">编辑</button>
                <button v-if="!archivedIds.has(note.id) || localNotes.some((item) => item.id === note.id)" type="button" @click="deleteNote(note)">删除</button>
              </div>
            </article>
          </div>

        </aside>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const { Layout } = DefaultTheme
const route = useRoute()

const isOpen = ref(false)
const svgMarkup = ref('')
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)

let startX = 0
let startY = 0
let pointerId: number | null = null

function resetView() {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
}

function openDiagram(container: HTMLElement) {
  const svg = container.querySelector('svg')
  if (!svg) return

  svgMarkup.value = svg.outerHTML
  resetView()
  isOpen.value = true
  document.body.classList.add('mermaid-zoom-open')
}

function closeDiagram() {
  isOpen.value = false
  svgMarkup.value = ''
  document.body.classList.remove('mermaid-zoom-open')
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Element | null
  const container = target?.closest<HTMLElement>('.vp-doc .mermaid')
  if (container) openDiagram(container)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) closeDiagram()
}

function zoomBy(factor: number) {
  scale.value = Math.min(5, Math.max(0.25, scale.value * factor))
}

function handleWheel(event: WheelEvent) {
  zoomBy(event.deltaY < 0 ? 1.15 : 1 / 1.15)
}

function startDrag(event: PointerEvent) {
  if (event.button !== 0) return
  isDragging.value = true
  pointerId = event.pointerId
  startX = event.clientX - offsetX.value
  startY = event.clientY - offsetY.value
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function drag(event: PointerEvent) {
  if (!isDragging.value || event.pointerId !== pointerId) return
  offsetX.value = event.clientX - startX
  offsetY.value = event.clientY - startY
}

function stopDrag(event: PointerEvent) {
  if (event.pointerId !== pointerId) return
  isDragging.value = false
  pointerId = null
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('mermaid-zoom-open')
})

watch(
  () => route.path,
  async () => {
    closeDiagram()
    await nextTick()
  }
)
</script>

<template>
  <Layout />
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="mermaid-zoom-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Mermaid 图表放大查看"
    >
      <div class="mermaid-zoom-toolbar">
        <button type="button" aria-label="缩小" @click="zoomBy(1 / 1.2)">−</button>
        <span>{{ Math.round(scale * 100) }}%</span>
        <button type="button" aria-label="放大" @click="zoomBy(1.2)">+</button>
        <button type="button" @click="resetView">重置</button>
        <button type="button" aria-label="关闭" @click="closeDiagram">关闭</button>
      </div>
      <div
        class="mermaid-zoom-stage"
        :class="{ 'is-dragging': isDragging }"
        @wheel.prevent="handleWheel"
        @pointerdown="startDrag"
        @pointermove="drag"
        @pointerup="stopDrag"
        @pointercancel="stopDrag"
        @dblclick="resetView"
      >
        <div
          class="mermaid-zoom-content"
          :style="{
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
          }"
          v-html="svgMarkup"
        />
      </div>
    </div>
  </Teleport>
</template>

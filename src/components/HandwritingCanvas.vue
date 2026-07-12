<template>
  <div class="flex flex-col items-center gap-2">
    <div class="border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
      <canvas
        ref="canvasEl"
        :width="canvasSize"
        :height="canvasSize"
        class="block cursor-crosshair touch-none"
        @mousedown="startStroke"
        @mousemove="continueStroke"
        @mouseup="endStroke"
        @mouseleave="endStroke"
        @touchstart.prevent="startTouch"
        @touchmove.prevent="continueTouch"
        @touchend.prevent="endStroke"
      ></canvas>
    </div>
    <div class="flex gap-2">
      <button
        class="px-4 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-default"
        :disabled="strokes.length === 0"
        @click="undoStroke"
      >
        Undo
      </button>
      <button
        class="px-4 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-default"
        :disabled="strokes.length === 0"
        @click="clearCanvas"
      >
        Clear
      </button>
    </div>
    <div v-if="!ready" class="text-xs text-gray-400">Loading recognition engine...</div>
    <div v-else-if="loading" class="text-xs text-blue-500 animate-pulse">Recognizing...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { StrokeData } from '../types/hanzi-lookup'

const props = defineProps<{
  ready: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  lookup: [strokes: StrokeData]
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const canvasSize = 280

const strokes = ref<StrokeData>([])
const currentStroke = ref<[number, number][]>([])
const isDrawing = ref(false)

let ctx: CanvasRenderingContext2D | null = null

onMounted(() => {
  if (canvasEl.value) {
    ctx = canvasEl.value.getContext('2d')
    drawGrid()
  }
})

function getPos(e: MouseEvent | Touch): [number, number] {
  if (!canvasEl.value) return [0, 0]
  const rect = canvasEl.value.getBoundingClientRect()
  const scaleX = canvasSize / rect.width
  const scaleY = canvasSize / rect.height
  return [
    (e.clientX - rect.left) * scaleX,
    (e.clientY - rect.top) * scaleY,
  ]
}

function drawGrid() {
  if (!ctx || !canvasEl.value) return
  const { width, height } = canvasEl.value
  ctx.clearRect(0, 0, width, height)
  ctx.setLineDash([2, 2])
  ctx.lineWidth = 0.5
  ctx.strokeStyle = '#d4d4d4'
  const midX = width / 2, midY = height / 2
  ctx.beginPath(); ctx.moveTo(midX, 0); ctx.lineTo(midX, height); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(width, midY); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(width, height); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(width, 0); ctx.lineTo(0, height); ctx.stroke()
  ctx.setLineDash([])
  ctx.strokeStyle = '#e5e5e5'
  ctx.strokeRect(0, 0, width, height)
}

function drawAllStrokes() {
  if (!ctx || !canvasEl.value) return
  drawGrid()
  ctx.setLineDash([])
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#1e293b'

  const allStrokes = [...strokes.value, ...(currentStroke.value.length ? [currentStroke.value] : [])]
  for (const stroke of allStrokes) {
    if (stroke.length < 2) continue
    ctx.beginPath()
    ctx.moveTo(stroke[0][0], stroke[0][1])
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i][0], stroke[i][1])
    }
    ctx.stroke()
  }
}

function startStroke(e: MouseEvent) {
  isDrawing.value = true
  currentStroke.value = [getPos(e)]
}

function continueStroke(e: MouseEvent) {
  if (!isDrawing.value) return
  const pos = getPos(e)
  const last = currentStroke.value[currentStroke.value.length - 1]
  if (Math.abs(pos[0] - last[0]) < 2 && Math.abs(pos[1] - last[1]) < 2) return
  currentStroke.value.push(pos)
  drawAllStrokes()
}

function startTouch(e: TouchEvent) {
  if (e.touches.length === 1) startStroke(e.touches[0] as any)
}

function continueTouch(e: TouchEvent) {
  if (e.touches.length === 1) continueStroke(e.touches[0] as any)
}

function endStroke() {
  if (!isDrawing.value) return
  isDrawing.value = false
  if (currentStroke.value.length > 1) {
    strokes.value.push([...currentStroke.value])
  }
  currentStroke.value = []
  drawAllStrokes()
  emitLookup()
}

function emitLookup() {
  if (strokes.value.length > 0) {
    const raw = JSON.parse(JSON.stringify(strokes.value))
    emit('lookup', raw)
  }
}

function undoStroke() {
  strokes.value.pop()
  drawAllStrokes()
  emitLookup()
}

function clearCanvas() {
  strokes.value = []
  currentStroke.value = []
  drawGrid()
}

defineExpose({ clearCanvas, undoStroke })
</script>

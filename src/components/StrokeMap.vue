<template>
  <div class="flex flex-col items-center">
    <div v-if="loading" class="text-xs text-gray-400 dark:text-gray-500 text-center py-10">Loading...</div>
    <div v-else-if="error" class="text-xs text-red-500 text-center py-4">{{ error }}</div>

    <div v-else-if="data" class="flex flex-col items-center gap-3 h-full">
      <svg
        :viewBox="charViewBox"
        class="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Y-flip: data uses bottom-left origin, SVG uses top-left -->
        <g :transform="`matrix(1 0 0 -1 0 ${dataMaxY + dataMinY})`">
          <!-- 米字格 grid -->
          <rect
            :x="gridMinX" :y="gridMinY"
            :width="gridSize" :height="gridSize"
            :stroke="gridColor" stroke-width="2" fill="none"
          />
          <line :x1="gridMinX" :y1="midY" :x2="gridMinX + gridSize" :y2="midY" :stroke="gridColor" stroke-width="1" stroke-dasharray="6,4" />
          <line :x1="midX" :y1="gridMinY" :x2="midX" :y2="gridMinY + gridSize" :stroke="gridColor" stroke-width="1" stroke-dasharray="6,4" />
          <line :x1="gridMinX" :y1="gridMinY" :x2="gridMinX + gridSize" :y2="gridMinY + gridSize" :stroke="gridColor" stroke-width="0.75" stroke-dasharray="4,6" />
          <line :x1="gridMinX + gridSize" :y1="gridMinY" :x2="gridMinX" :y2="gridMinY + gridSize" :stroke="gridColor" stroke-width="0.75" stroke-dasharray="4,6" />
          <!-- Strokes -->
          <path
            v-for="(stroke, i) in data.strokes"
            :key="i"
            :d="stroke"
            :fill="i < currentStep ? activeFillColor : baseFillColor"
            :stroke="i < currentStep ? activeStrokeColor : strokeColor"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
        <!-- Stroke numbers (flipped Y) -->
        <g v-for="(_, i) in data.medians" :key="'n'+i">
          <template v-if="data.medians[i]?.length">
            <circle
              :cx="data.medians[i][0][0]"
              :cy="flipY(data.medians[i][0][1])"
              r="35"
              :fill="numberBgColor"
              opacity="0.92"
            />
            <text
              :x="data.medians[i][0][0]"
              :y="flipY(data.medians[i][0][1])"
              text-anchor="middle"
              dominant-baseline="central"
              :fill="numberTextColor"
              font-size="36"
              font-weight="bold"
              style="font-family: -apple-system, BlinkMacSystemFont, sans-serif"
            >{{ i + 1 }}</text>
          </template>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { loadStrokeData, type CharStrokeData, computeCharBounds } from '../data/strokeData'

const props = defineProps<{
  character?: string
  isDark: boolean
}>()

const data = ref<CharStrokeData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const currentStep = ref(0)

// Bounds
const dataMinX = ref(0)
const dataMinY = ref(0)
const dataMaxX = ref(1024)
const dataMaxY = ref(1024)

// Square grid with internal padding around character
const gridSize = computed(() => {
  const w = (dataMaxX.value - dataMinX.value) * 1.15
  const h = (dataMaxY.value - dataMinY.value) * 1.15
  return Math.max(w, h, 50)
})
const gridCX = computed(() => (dataMinX.value + dataMaxX.value) / 2)
const gridCY = computed(() => (dataMinY.value + dataMaxY.value) / 2)
const gridMinX = computed(() => gridCX.value - gridSize.value / 2)
const gridMinY = computed(() => gridCY.value - gridSize.value / 2)

const charViewBox = computed(() => {
  const pad = gridSize.value * 0.06 + 12
  const size = gridSize.value + pad * 2
  return `${gridMinX.value - pad} ${gridMinY.value - pad} ${size} ${size}`
})

// Colors — bumped contrast
const strokeColor = computed(() => props.isDark ? '#b0bec5' : '#64748b')
const activeStrokeColor = computed(() => props.isDark ? '#e0e0e0' : '#334155')
const baseFillColor = computed(() => props.isDark ? 'rgba(176,190,197,0.25)' : 'rgba(100,116,139,0.13)')
const activeFillColor = computed(() => props.isDark ? 'rgba(176,190,197,0.5)' : 'rgba(100,116,139,0.28)')
const numberBgColor = computed(() => props.isDark ? '#64748b' : '#1e293b')
const numberTextColor = computed(() => '#ffffff')
const gridColor = computed(() => props.isDark ? '#475569' : '#cbd5e1')

const midX = computed(() => gridCX.value)
const midY = computed(() => gridCY.value)

function flipY(y: number): number {
  return dataMaxY.value + dataMinY.value - y
}

watch(() => props.character, async (char) => {
  data.value = null
  error.value = null
  currentStep.value = 0
  if (!char) return

  loading.value = true
  try {
    data.value = await loadStrokeData(char)
    const b = computeCharBounds(data.value)
    dataMinX.value = b.minX
    dataMinY.value = b.minY
    dataMaxX.value = b.maxX
    dataMaxY.value = b.maxY
  } catch (e: any) {
    error.value = e.message || 'Failed to load stroke data'
  } finally {
    loading.value = false
  }
}, { immediate: true })

defineExpose({ currentStep })
</script>

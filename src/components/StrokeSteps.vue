<template>
  <div class="flex flex-col items-center">
    <div v-if="loading" class="text-xs text-gray-400 dark:text-gray-500 text-center py-10">Loading...</div>
    <div v-else-if="error" class="text-xs text-red-500 text-center py-4">{{ error }}</div>

    <div v-else-if="data" class="w-full">
      <div class="grid grid-cols-4 sm:grid-cols-5 gap-2">
        <button
          v-for="(stroke, i) in data.strokes"
          :key="i"
          class="aspect-square border rounded-lg transition-all p-1.5 flex flex-col items-center justify-between"
          :class="i < currentStep
            ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-600'"
          @click="toggleStep(i + 1)"
        >
          <svg :viewBox="stepViewBox(i)" class="w-full flex-1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <!-- Y-flip for data coords -->
            <g :transform="`matrix(1 0 0 -1 0 ${strokeMaxY(i) + strokeMinY(i)})`">
              <path
                :d="stroke"
                :fill="i < currentStep ? activeFillColor : baseFillColor"
                :stroke="i < currentStep ? activeStrokeColor : strokeColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <!-- Direction dot at start (flipped Y) -->
            <circle
              v-if="data.medians[i]?.length"
              :cx="data.medians[i][0][0]"
              :cy="strokeMaxY(i) + strokeMinY(i) - data.medians[i][0][1]"
              r="12"
              :fill="accentColor"
            />
          </svg>
          <span
            class="text-[11px] font-bold mt-0.5"
            :class="i < currentStep ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'"
          >{{ i + 1 }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { loadStrokeData, type CharStrokeData, computeStrokeBounds } from '../data/strokeData'

const props = defineProps<{
  character?: string
  isDark: boolean
}>()

const emit = defineEmits<{
  stepChange: [step: number]
}>()

const data = ref<CharStrokeData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const currentStep = ref(0)

// Colors — bumped contrast
const strokeColor = computed(() => props.isDark ? '#b0bec5' : '#64748b')
const activeStrokeColor = computed(() => props.isDark ? '#e0e0e0' : '#334155')
const baseFillColor = computed(() => props.isDark ? 'rgba(176,190,197,0.25)' : 'rgba(100,116,139,0.13)')
const activeFillColor = computed(() => props.isDark ? 'rgba(176,190,197,0.5)' : 'rgba(100,116,139,0.28)')
const accentColor = computed(() => props.isDark ? '#f87171' : '#ef4444')

// Stroke-level bounds from median data
function strokeMinY(i: number): number {
  if (!data.value?.medians[i]?.length) return 0
  return computeStrokeBounds(data.value.medians[i]).minY
}
function strokeMaxY(i: number): number {
  if (!data.value?.medians[i]?.length) return 1024
  return computeStrokeBounds(data.value.medians[i]).maxY
}

function stepViewBox(i: number): string {
  if (!data.value?.medians[i]?.length) return '0 0 1024 1024'
  const b = computeStrokeBounds(data.value.medians[i])
  const w = b.maxX - b.minX
  const h = b.maxY - b.minY
  const pad = Math.max(w, h) * 0.5 + 10
  return `${b.minX - pad} ${b.minY - pad} ${w + pad * 2} ${h + pad * 2}`
}

function toggleStep(step: number) {
  currentStep.value = currentStep.value === step ? 0 : step
  emit('stepChange', currentStep.value)
}

watch(() => props.character, async (char) => {
  data.value = null
  error.value = null
  currentStep.value = 0
  if (!char) return

  loading.value = true
  try {
    data.value = await loadStrokeData(char)
  } catch (e: any) {
    error.value = e.message || 'Failed to load stroke data'
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>

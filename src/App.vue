<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">HanziLens</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Draw &middot; Recognize &middot; Learn stroke order</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- GitHub link -->
          <a
            href="https://github.com/guangzhiyao/hanzi-lens"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="View on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <!-- Dark mode toggle -->
          <button
            class="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleDark"
          >
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <!-- Script toggle -->
          <span class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
            {{ scriptMode === 'simplified' ? '简体' : '繁體' }}
          </span>
          <button
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="scriptMode === 'simplified' ? 'bg-blue-600' : 'bg-amber-600'"
            @click="toggleScript"
            :title="scriptMode === 'simplified' ? 'Switch to Traditional' : 'Switch to Simplified'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="scriptMode === 'simplified' ? 'translate-x-1' : 'translate-x-6'"
            />
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-6xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- 1. Draw -->
        <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">✍️ Draw</h2>
          <HandwritingCanvas
            :ready="lookupReady"
            :loading="lookupLoading"
            :is-dark="isDark"
            @lookup="onLookup"
          />
        </section>

        <!-- 2. Results -->
        <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">🔍 Results</h2>
          <div v-if="lookupError" class="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-lg p-3">{{ lookupError }}</div>
          <div v-else-if="filteredMatches.length > 0" class="grid grid-cols-4 gap-2">
            <button
              v-for="(match, i) in filteredMatches"
              :key="match.hanzi + i"
              class="aspect-square text-xl font-bold border-2 rounded-lg transition-all font-['PingFang_SC','Noto_Sans_SC','Microsoft_YaHei',sans-serif]"
              :class="selectedChar === match.hanzi
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950'"
              @click="selectChar(match.hanzi)"
            >
              {{ match.hanzi }}
            </button>
          </div>
          <div v-else class="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
            Draw a character on the left
          </div>
        </section>

        <!-- 3. Stroke Order -->
        <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">📝 Stroke Order</h2>
          <StrokeViewer :character="selectedChar" :is-dark="isDark" @character-selected="selectChar" />
        </section>

        <!-- 4. Dictionary -->
        <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">📖 Dictionary</h2>
          <CharacterInfo
            :character="selectedChar || ''"
            :entry="dictEntry"
            :loading="dictLoading"
          />
        </section>

        <!-- 5. Stroke Map (numbered overview) -->
        <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">🔢 Stroke Map</h2>
          <StrokeMap ref="strokeMapRef" :character="selectedChar" :is-dark="isDark" class="flex-1 min-h-0" />
        </section>

        <!-- 6. Step-by-step grid -->
        <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">🧩 Steps</h2>
          <StrokeSteps
            ref="strokeStepsRef"
            :character="selectedChar"
            :is-dark="isDark"
            @step-change="onStepChange"
          />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import HandwritingCanvas from './components/HandwritingCanvas.vue'
import StrokeViewer from './components/StrokeViewer.vue'
import StrokeMap from './components/StrokeMap.vue'
import StrokeSteps from './components/StrokeSteps.vue'
import CharacterInfo from './components/CharacterInfo.vue'
import { useHanziLookup } from './composables/useHanziLookup'
import { useDarkMode } from './composables/useDarkMode'
import { lookupMulti, isTraditional } from './data/dictionary'
import type { DictEntry } from './data/dictionary'
import type { StrokeData } from './types/hanzi-lookup'

const { ready: lookupReady, loading: lookupLoading, error: lookupError, matches, init, lookup } = useHanziLookup()
const { isDark, toggle: toggleDark } = useDarkMode()

const selectedChar = ref<string | undefined>(undefined)
const dictEntry = ref<DictEntry | null>(null)
const dictLoading = ref(false)

const strokeMapRef = ref<InstanceType<typeof StrokeMap> | null>(null)

const scriptMode = ref<'simplified' | 'traditional'>('simplified')

function toggleScript() {
  scriptMode.value = scriptMode.value === 'simplified' ? 'traditional' : 'simplified'
}

const filteredMatches = computed(() => {
  if (scriptMode.value === 'traditional') return matches.value
  return matches.value.filter(m => !isTraditional(m.hanzi))
})

function onStepChange(step: number) {
  if (strokeMapRef.value) {
    strokeMapRef.value.currentStep = step
  }
}

watch(selectedChar, async (char) => {
  if (!char) {
    dictEntry.value = null
    return
  }
  dictLoading.value = true
  dictEntry.value = await lookupMulti(char)
  dictLoading.value = false
})

onMounted(async () => {
  try { await init() } catch (e) {
    console.error('Failed to init Hanzi Lookup:', e)
  }
})

function onLookup(strokes: StrokeData) {
  lookup(strokes, 8)
}

function selectChar(hanzi: string) {
  selectedChar.value = hanzi
}
</script>

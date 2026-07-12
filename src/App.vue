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
        <!-- Left: Handwriting -->
        <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">✍️ Draw</h2>
          <HandwritingCanvas
            :ready="lookupReady"
            :loading="lookupLoading"
            :is-dark="isDark"
            @lookup="onLookup"
          />
        </section>

        <!-- Center: Results -->
        <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 lg:col-span-1">
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

        <!-- Right-top: Stroke Order -->
        <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">📝 Stroke Order</h2>
          <StrokeViewer :character="selectedChar" :is-dark="isDark" />
        </section>

        <!-- Right-bottom: Dictionary -->
        <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">📖 Dictionary</h2>
          <CharacterInfo
            :character="selectedChar || ''"
            :entry="dictEntry"
            :loading="dictLoading"
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

// Script mode toggle: 'simplified' | 'traditional'
const scriptMode = ref<'simplified' | 'traditional'>('simplified')

function toggleScript() {
  scriptMode.value = scriptMode.value === 'simplified' ? 'traditional' : 'simplified'
}

// Filter matches based on script mode
const filteredMatches = computed(() => {
  if (scriptMode.value === 'traditional') return matches.value
  // Simplified mode: exclude traditional-only characters
  return matches.value.filter(m => !isTraditional(m.hanzi))
})

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

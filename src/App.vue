<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">HanziLens</h1>
          <p class="text-sm text-gray-500">Draw &middot; Recognize &middot; Learn stroke order</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">
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
        <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">✍️ Draw</h2>
          <HandwritingCanvas
            :ready="lookupReady"
            :loading="lookupLoading"
            @lookup="onLookup"
          />
        </section>

        <!-- Center: Results -->
        <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:col-span-1">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">🔍 Results</h2>
          <div v-if="lookupError" class="text-sm text-red-500 bg-red-50 rounded-lg p-3">{{ lookupError }}</div>
          <div v-else-if="filteredMatches.length > 0" class="grid grid-cols-4 gap-2">
            <button
              v-for="(match, i) in filteredMatches"
              :key="match.hanzi + i"
              class="aspect-square text-xl font-bold border-2 rounded-lg transition-all font-['PingFang_SC','Noto_Sans_SC','Microsoft_YaHei',sans-serif]"
              :class="selectedChar === match.hanzi
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]'
                : 'border-gray-200 bg-gray-50 text-gray-800 hover:border-blue-400 hover:bg-blue-50'"
              @click="selectChar(match.hanzi)"
            >
              {{ match.hanzi }}
            </button>
          </div>
          <div v-else class="text-sm text-gray-400 text-center py-10">
            Draw a character on the left
          </div>
        </section>

        <!-- Right-top: Stroke Order -->
        <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">📝 Stroke Order</h2>
          <StrokeViewer :character="selectedChar" />
        </section>

        <!-- Right-bottom: Dictionary -->
        <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">📖 Dictionary</h2>
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
import { lookupMulti, isTraditional } from './data/dictionary'
import type { DictEntry } from './data/dictionary'
import type { StrokeData } from './types/hanzi-lookup'

const { ready: lookupReady, loading: lookupLoading, error: lookupError, matches, init, lookup } = useHanziLookup()

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

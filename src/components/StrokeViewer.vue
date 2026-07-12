<template>
  <div class="flex flex-col items-center gap-3">
    <!-- Character input -->
    <div class="flex gap-2 items-center">
      <input
        ref="inputEl"
        v-model="character"
        type="text"
        maxlength="1"
        placeholder="Enter character..."
        class="w-36 px-3 py-2 text-lg text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        @keyup.enter="loadCharacter"
      />
      <button
        class="px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40"
        :disabled="!character"
        @click="loadCharacter"
      >
        Show
      </button>
    </div>

    <!-- Viewer -->
    <div v-if="currentChar" :key="currentChar + '-' + (isDark ? 'd' : 'l')" class="flex flex-col items-center gap-2">
      <!-- Error state -->
      <div v-if="loadError" class="w-[200px] h-[200px] flex flex-col items-center justify-center text-center gap-1.5 rounded-xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-3">
        <span class="text-red-500 text-sm font-medium">Failed to load</span>
        <span class="text-xs text-red-400 dark:text-red-500">{{ loadError }}</span>
      </div>

      <!-- Writer target (hidden when error) -->
      <div
        v-show="!loadError"
        ref="writerTarget"
        class="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800"
      ></div>

      <div class="flex gap-2">
        <button
          class="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 text-gray-700 dark:text-gray-300"
          :disabled="!!loadError"
          @click="animate"
        >
          ▶ Animate
        </button>
        <button
          class="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 text-gray-700 dark:text-gray-300"
          :disabled="!!loadError"
          @click="quizMode"
        >
          ✏️ Quiz
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="w-[200px] h-[200px] flex items-center justify-center text-center text-sm text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
      Type a character or click one from handwriting results
    </div>

    <!-- Quiz result modal -->
    <ResultModal
      :visible="showQuizResult"
      title="Quiz Complete!"
      :message="quizResultMessage"
      :detail="quizResultDetail"
      emoji="🎉"
      primary-label="OK"
      @close="showQuizResult = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import HanziWriter from 'hanzi-writer'
import ResultModal from './ResultModal.vue'

const props = defineProps<{
  character?: string
  isDark: boolean
}>()

const character = ref('')
const currentChar = ref<string | null>(null)
const loadError = ref<string | null>(null)
const writerTarget = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

const showQuizResult = ref(false)
const quizResultMessage = ref('')
const quizResultDetail = ref('')

let writer: HanziWriter | null = null

watch(() => props.character, (newChar) => {
  if (newChar) {
    character.value = newChar
    currentChar.value = newChar
  }
})

function createWriter(char: string) {
  loadError.value = null
  if (!writerTarget.value) {
    loadError.value = 'DOM not ready'
    return
  }
  if (writer) {
    try { writer.destroy() } catch {}
    writer = null
  }
  writerTarget.value.innerHTML = ''

  const d = props.isDark

  try {
    writer = new HanziWriter(writerTarget.value, {
      width: 200,
      height: 200,
      padding: 5,
      showOutline: true,
      showCharacter: false,
      strokeAnimationSpeed: 1.5,
      delayBetweenStrokes: 300,
      strokeColor: d ? '#e2e8f0' : '#1e293b',
      outlineColor: d ? '#374151' : '#e2e8f0',
      highlightColor: d ? '#f87171' : '#ef4444',
      radicalColor: d ? '#60a5fa' : '#3b82f6',
      onLoadCharDataSuccess: () => { loadError.value = null },
      onLoadCharDataError: (err: any) => {
        loadError.value = String(err || 'Unknown error')
      },
    })
    writer.setCharacter(char)
  } catch (e: any) {
    loadError.value = e.message || String(e)
    writer = null
  }
}

watch(currentChar, (char) => {
  if (!char) return
  setTimeout(() => createWriter(char), 0)
})

// Recreate writer when dark mode toggles
watch(() => props.isDark, () => {
  if (currentChar.value) {
    setTimeout(() => createWriter(currentChar.value!), 0)
  }
})

function loadCharacter() {
  const char = character.value.trim()
  if (!char) return
  currentChar.value = char
}

function animate() {
  writer?.animateCharacter()
}

function quizMode() {
  if (!writer) return
  writer.quiz({
    onMistake: () => {},
    onCorrectStroke: () => {},
    onComplete: (summary) => {
      const total = summary.totalMistakes + summary.strokesRemaining
      const pct = total > 0 ? Math.round((summary.strokesRemaining / total) * 100) : 100
      quizResultMessage.value = `Accuracy: ${pct}%`
      quizResultDetail.value = `${summary.strokesRemaining} correct, ${summary.totalMistakes} mistake${summary.totalMistakes !== 1 ? 's' : ''}`
      showQuizResult.value = true
    },
    showHintAfterMisses: 2,
    highlightOnComplete: true,
  })
}

defineExpose({ focus: () => inputEl.value?.focus() })
</script>

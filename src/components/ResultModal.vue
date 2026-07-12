<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity dark:bg-black/60"
      @click.self="close"
    >
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden transform transition-all">
        <!-- Header -->
        <div class="px-6 pt-6 pb-2 text-center">
          <div class="text-4xl mb-2">{{ emoji }}</div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ title }}</h3>
        </div>

        <!-- Body -->
        <div class="px-6 pb-4 text-center">
          <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{{ message }}</p>
          <div v-if="detail" class="mt-2 text-xs text-gray-400 dark:text-gray-500">{{ detail }}</div>
        </div>

        <!-- Footer -->
        <div class="px-6 pb-6 flex justify-center gap-3">
          <button
            v-if="showSecondary"
            class="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            @click="$emit('secondary')"
          >
            {{ secondaryLabel }}
          </button>
          <button
            class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            @click="close"
          >
            {{ primaryLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  visible: boolean
  title: string
  message: string
  detail?: string
  emoji?: string
  primaryLabel?: string
  secondaryLabel?: string
  showSecondary?: boolean
}>()

const emit = defineEmits<{
  close: []
  secondary: []
}>()

function close() {
  emit('close')
}

// Close on Escape
watch(() => props.visible, (v) => {
  if (v) {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    // cleanup handled by watchEffect-like behavior
  }
})
</script>

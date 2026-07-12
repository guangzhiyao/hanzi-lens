<template>
  <div v-if="loading" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
    <div class="text-center text-sm text-gray-400 dark:text-gray-500">Loading...</div>
  </div>
  <div v-else-if="entry" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
    <div class="text-center">
      <div class="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-1 font-['PingFang_SC','Noto_Sans_SC','Microsoft_YaHei',sans-serif]">
        {{ character }}
      </div>
      <div class="text-lg text-blue-600 dark:text-blue-400 font-medium mb-1">{{ entry.pinyin }}</div>
      <div class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ entry.meaning }}</div>
    </div>
  </div>
  <div v-else-if="character" class="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 shadow-sm">
    <div class="text-center">
      <div class="text-4xl font-bold text-gray-300 dark:text-gray-600 mb-1 font-['PingFang_SC','Noto_Sans_SC','Microsoft_YaHei',sans-serif]">
        {{ character }}
      </div>
      <div class="text-xs text-gray-400 dark:text-gray-500">Not in dictionary yet</div>
    </div>
  </div>
  <div v-else class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
    <div class="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
      Select a character to see its definition
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DictEntry } from '../data/dictionary'

defineProps<{
  character: string
  entry: DictEntry | null
  loading?: boolean
}>()
</script>

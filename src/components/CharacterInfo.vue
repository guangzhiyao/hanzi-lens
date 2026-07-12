<template>
  <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <div class="text-center text-sm text-gray-400">Loading...</div>
  </div>
  <div v-else-if="entry" class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <div class="text-center">
      <div class="text-4xl font-bold text-gray-800 mb-1 font-['PingFang_SC','Noto_Sans_SC','Microsoft_YaHei',sans-serif]">
        {{ character }}
      </div>
      <div class="text-lg text-blue-600 font-medium mb-1">{{ entry.pinyin }}</div>
      <div class="text-sm text-gray-500 leading-relaxed">{{ entry.meaning }}</div>
    </div>
  </div>
  <div v-else-if="character" class="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 shadow-sm">
    <div class="text-center">
      <div class="text-4xl font-bold text-gray-300 mb-1 font-['PingFang_SC','Noto_Sans_SC','Microsoft_YaHei',sans-serif]">
        {{ character }}
      </div>
      <div class="text-xs text-gray-400">Not in dictionary yet</div>
    </div>
  </div>
  <div v-else class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <div class="text-center text-sm text-gray-400 py-8">
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

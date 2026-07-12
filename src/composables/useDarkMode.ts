import { ref, watch } from 'vue'

const STORAGE_KEY = 'hanzi-lens-dark'

function applyDark(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
}

function getInitial(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'true'
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitial())
applyDark(isDark.value)

watch(isDark, (val) => {
  applyDark(val)
  try { localStorage.setItem(STORAGE_KEY, String(val)) } catch {}
})

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}

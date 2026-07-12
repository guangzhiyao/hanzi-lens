import { ref, type Ref } from 'vue'
import type { HanziMatch, StrokeData, WorkerResponse } from '../types/hanzi-lookup'

export function useHanziLookup() {
  const ready: Ref<boolean> = ref(false)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const matches: Ref<HanziMatch[]> = ref([])

  let worker: Worker | null = null

  function handleMessage(e: MessageEvent<WorkerResponse>) {
    const msg = e.data

    if (msg.type === 'ready') {
      ready.value = true
    } else if (msg.type === 'result') {
      loading.value = false
      matches.value = msg.matches
    } else if (msg.type === 'error') {
      loading.value = false
      error.value = msg.message
      console.error('[hanzi-lookup] worker error:', msg.message)
    }
  }

  function init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        worker = new Worker(`${import.meta.env.BASE_URL}workers/hanzi-lookup.worker.js`)
        worker.onmessage = handleMessage
        worker.onerror = (e) => {
          console.error('[hanzi-lookup] worker onerror:', e)
          reject(new Error(e.message))
        }

        worker.postMessage({
          type: 'init',
          wasmJsUri: `${import.meta.env.BASE_URL}wasm/hanzi_lookup.js`,
          wasmUri: `${import.meta.env.BASE_URL}wasm/hanzi_lookup_bg.wasm`,
        })

        const timeout = setTimeout(() => {
          if (!ready.value) reject(new Error('WASM init timed out'))
        }, 15000)

        const interval = setInterval(() => {
          if (ready.value) {
            clearTimeout(timeout)
            clearInterval(interval)
            resolve()
          }
        }, 200)
      } catch (e) {
        reject(e)
      }
    })
  }

  function lookup(strokes: StrokeData, limit: number = 8) {
    if (!worker || !ready.value) {
      error.value = 'Lookup not initialized'
      return
    }
    loading.value = true
    error.value = null

    try {
      worker.postMessage({ type: 'lookup', strokes, limit })
    } catch (e: any) {
      console.error('[hanzi-lookup] postMessage failed:', e)
      error.value = 'postMessage: ' + (e.message || e)
      loading.value = false
    }
  }

  function destroy() {
    worker?.terminate()
    worker = null
    ready.value = false
  }

  return { ready, loading, error, matches, init, lookup, destroy }
}

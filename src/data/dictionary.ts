import { formatPinyin } from './pinyin'

export interface DictEntry {
  pinyin: string   // tone-marked display form
  meaning: string
}

// Raw data format from /dict.json
interface RawDictEntry {
  p: string  // numbered pinyin, pipe-separated: "hao3|hao4"
  m: string  // meanings, pipe-separated
  t?: boolean // true if this is a traditional-only character form
  s?: string  // simplified counterpart (only set on traditional chars)
}

let dictData: Record<string, RawDictEntry> | null = null
let loadPromise: Promise<void> | null = null

async function ensureLoaded(): Promise<void> {
  if (dictData) return
  if (!loadPromise) {
    loadPromise = fetch('/dict.json')
      .then(r => r.json())
      .then(data => { dictData = data })
  }
  return loadPromise
}

// Pre-load eagerly
ensureLoaded()

export async function lookup(char: string): Promise<DictEntry | null> {
  await ensureLoaded()
  if (!dictData) return null

  const raw = dictData[char]
  if (!raw) return null

  // Take first reading as primary
  const pinyinRaw = raw.p.split('|')[0]
  const meaningRaw = raw.m.split('|')[0]

  return {
    pinyin: formatPinyin(pinyinRaw),
    meaning: meaningRaw,
  }
}

export async function lookupMulti(char: string): Promise<DictEntry | null> {
  await ensureLoaded()
  if (!dictData) return null

  // Try exact match first (single char)
  if (dictData[char]) {
    return lookup(char)
  }

  // For multi-character, build from individual chars
  const parts = [...char]
  const results = await Promise.all(parts.map(c => lookup(c)))

  if (results.every(r => r !== null)) {
    return {
      pinyin: results.map(r => r!.pinyin).join(' '),
      meaning: results.map(r => r!.meaning).join(' + '),
    }
  }

  // Partial: some chars found
  const found = results.filter(r => r !== null)
  if (found.length > 0) {
    return {
      pinyin: parts.map((_, i) => results[i]?.pinyin || '?').join(' '),
      meaning: found.map(r => r!.meaning).join(' + '),
    }
  }

  return null
}

// Synchronous fallback (may return null if not loaded yet)
export function lookupSync(char: string): DictEntry | null {
  if (!dictData) return null

  const raw = dictData[char]
  if (!raw) return null

  return {
    pinyin: formatPinyin(raw.p.split('|')[0]),
    meaning: raw.m.split('|')[0],
  }
}

// Check if a character is a traditional-only form
export function isTraditional(char: string): boolean {
  if (!dictData) return false
  const raw = dictData[char]
  return raw?.t === true
}

// Get the simplified counterpart of a traditional character
export function toSimplified(char: string): string {
  if (!dictData) return char
  const raw = dictData[char]
  return raw?.s || char
}

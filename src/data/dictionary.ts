import { formatPinyin } from './pinyin'

export interface DictEntry {
  pinyin: string      // primary reading (tone-marked display form)
  meaning: string     // primary meaning
  readings: string[]  // all readings (tone-marked)
  meanings: string[]  // all meanings
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
    loadPromise = fetch(`${import.meta.env.BASE_URL}dict.json`)
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

  const readingsRaw = raw.p.split('|')
  const meaningsRaw = raw.m.split('|')

  // Pair readings with meanings
  const pairs = readingsRaw.map((r, i) => ({
    raw: r,
    meaning: meaningsRaw[i] || '',
  }))

  // Sort: common nouns (lowercase) before proper nouns (capitalized)
  pairs.sort((a, b) => {
    const aIsProper = a.raw[0] === a.raw[0]?.toUpperCase() && a.raw[0] !== a.raw[0]?.toLowerCase()
    const bIsProper = b.raw[0] === b.raw[0]?.toUpperCase() && b.raw[0] !== b.raw[0]?.toLowerCase()
    if (aIsProper && !bIsProper) return 1
    if (!aIsProper && bIsProper) return -1
    return 0
  })

  const readings = pairs.map(p => formatPinyin(p.raw))
  const meanings = pairs.map(p => p.meaning)

  return {
    pinyin: readings[0],
    meaning: meanings[0],
    readings,
    meanings,
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
      readings: [results.map(r => r!.pinyin).join(' ')],
      meanings: [results.map(r => r!.meaning).join(' + ')],
    }
  }

  // Partial: some chars found
  const found = results.filter(r => r !== null)
  if (found.length > 0) {
    return {
      pinyin: parts.map((_, i) => results[i]?.pinyin || '?').join(' '),
      meaning: found.map(r => r!.meaning).join(' + '),
      readings: [parts.map((_, i) => results[i]?.pinyin || '?').join(' ')],
      meanings: [found.map(r => r!.meaning).join(' + ')],
    }
  }

  return null
}

// Synchronous fallback (may return null if not loaded yet)
export function lookupSync(char: string): DictEntry | null {
  if (!dictData) return null

  const raw = dictData[char]
  if (!raw) return null

  const readingsRaw = raw.p.split('|')
  const meaningsRaw = raw.m.split('|')

  const pairs = readingsRaw.map((r, i) => ({
    raw: r,
    meaning: meaningsRaw[i] || '',
  }))

  pairs.sort((a, b) => {
    const aIsProper = a.raw[0] === a.raw[0]?.toUpperCase() && a.raw[0] !== a.raw[0]?.toLowerCase()
    const bIsProper = b.raw[0] === b.raw[0]?.toUpperCase() && b.raw[0] !== b.raw[0]?.toLowerCase()
    if (aIsProper && !bIsProper) return 1
    if (!aIsProper && bIsProper) return -1
    return 0
  })

  const readings = pairs.map(p => formatPinyin(p.raw))
  const meanings = pairs.map(p => p.meaning)

  return {
    pinyin: readings[0],
    meaning: meanings[0],
    readings,
    meanings,
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

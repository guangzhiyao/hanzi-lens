export interface CharStrokeData {
  strokes: string[]   // SVG path strings, one per stroke
  medians: number[][][]  // median line points [[[x,y],...], ...]
}

export interface CharBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** Resolve the local data path for a character's stroke data */
function charDataUrl(char: string): string {
  return `${import.meta.env.BASE_URL}data/chars/${char}.json`
}

const cache = new Map<string, { data: CharStrokeData } | { error: string }>()

export async function loadStrokeData(char: string): Promise<CharStrokeData> {
  const cached = cache.get(char)
  if (cached) {
    if ('error' in cached) throw new Error(cached.error)
    return cached.data
  }

  try {
    const res = await fetch(charDataUrl(char))
    if (!res.ok) {
      const msg = res.status === 404
        ? `No stroke data available for ${char}`
        : `Failed to load (HTTP ${res.status})`
      cache.set(char, { error: msg })
      throw new Error(msg)
    }
    const json = await res.json()
    const data: CharStrokeData = {
      strokes: json.strokes || [],
      medians: json.medians || [],
    }
    cache.set(char, { data })
    return data
  } catch (e: any) {
    const msg = e?.message || 'Failed to load stroke data'
    if (!cache.has(char)) cache.set(char, { error: msg })
    throw new Error(msg)
  }
}

/** Compute the tight bounding box of all strokes from median data */
export function computeCharBounds(data: CharStrokeData): CharBounds {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  for (const median of data.medians) {
    for (const [x, y] of median) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  // Fallback if no data
  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 1024, maxY: 1024 }

  return { minX, minY, maxX, maxY }
}

/** Compute bounding box of a single stroke from its median data */
export function computeStrokeBounds(median: number[][]): CharBounds {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  for (const [x, y] of median) {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }

  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 1024, maxY: 1024 }

  return { minX, minY, maxX, maxY }
}

// Convert numbered pinyin (hao3) to tone-marked pinyin (hǎo)
const toneMarks: Record<string, Record<number, string>> = {
  a: { 1: 'ā', 2: 'á', 3: 'ǎ', 4: 'à' },
  e: { 1: 'ē', 2: 'é', 3: 'ě', 4: 'è' },
  i: { 1: 'ī', 2: 'í', 3: 'ǐ', 4: 'ì' },
  o: { 1: 'ō', 2: 'ó', 3: 'ǒ', 4: 'ò' },
  u: { 1: 'ū', 2: 'ú', 3: 'ǔ', 4: 'ù' },
  ü: { 1: 'ǖ', 2: 'ǘ', 3: 'ǚ', 4: 'ǜ' },
}

const vowels = 'aeiouü'

function findVowelPos(syllable: string): number {
  // Rule: mark 'a' or 'e' first if present
  const aPos = syllable.indexOf('a')
  if (aPos >= 0) return aPos
  const ePos = syllable.indexOf('e')
  if (ePos >= 0) return ePos

  // Otherwise: mark the second vowel (or the only one)
  let firstVowel = -1
  for (let i = 0; i < syllable.length; i++) {
    if (vowels.includes(syllable[i])) {
      if (firstVowel >= 0) return i  // second vowel
      firstVowel = i
    }
  }
  return firstVowel
}

export function numberedToToneMark(pinyin: string): string {
  return pinyin.replace(/([a-zA-ZüÜ]+)([1-5])/g, (_, letters, tone) => {
    const num = parseInt(tone)
    if (num === 5) return letters.toLowerCase() // neutral tone: no mark

    const pos = findVowelPos(letters.toLowerCase())
    if (pos < 0) return letters.toLowerCase()

    const vowel = letters[pos].toLowerCase()
    const marked = toneMarks[vowel]?.[num]
    if (!marked) return letters.toLowerCase()

    const result = letters.split('')
    result[pos] = letters[pos] === letters[pos].toUpperCase()
      ? marked.toUpperCase()
      : marked
    return result.join('')
  })
}

// Convert numbered pinyin (hao3) to tone-marked pinyin (hǎo)
// Preserves input case: "Du1" → "Dū" (proper noun), "dou1" → "dōu" (common)
export function formatPinyin(pinyin: string): string {
  const parts = pinyin.split(' ')
  return parts.map(p => numberedToToneMark(p)).join(' ')
}

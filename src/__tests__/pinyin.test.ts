import { describe, it, expect } from 'vitest'
import { numberedToToneMark, formatPinyin } from '../data/pinyin'

describe('numberedToToneMark', () => {
  it('converts first tone', () => {
    expect(numberedToToneMark('ma1')).toBe('mā')
    expect(numberedToToneMark('zhong1')).toBe('zhōng')
  })

  it('converts second tone', () => {
    expect(numberedToToneMark('ma2')).toBe('má')
    expect(numberedToToneMark('guo2')).toBe('guó')
  })

  it('converts third tone', () => {
    expect(numberedToToneMark('ma3')).toBe('mǎ')
    expect(numberedToToneMark('hao3')).toBe('hǎo')
  })

  it('converts fourth tone', () => {
    expect(numberedToToneMark('ma4')).toBe('mà')
    expect(numberedToToneMark('da4')).toBe('dà')
  })

  it('handles neutral tone 5', () => {
    expect(numberedToToneMark('ma5')).toBe('ma')
    expect(numberedToToneMark('de5')).toBe('de')
  })

  it('handles ü vowel', () => {
    expect(numberedToToneMark('nü3')).toBe('nǚ')
    expect(numberedToToneMark('lü4')).toBe('lǜ')
  })

  it('marks correct vowel in compounds', () => {
    expect(numberedToToneMark('hao3')).toBe('hǎo')
    expect(numberedToToneMark('mei2')).toBe('méi')
    expect(numberedToToneMark('liu2')).toBe('liú')
    expect(numberedToToneMark('dui4')).toBe('duì')
  })

  it('handles uppercase', () => {
    expect(numberedToToneMark('Zhong1')).toBe('Zhōng')
  })
})

describe('formatPinyin', () => {
  it('preserves input case for common nouns', () => {
    expect(formatPinyin('hao3')).toBe('hǎo')
  })

  it('preserves input case for proper nouns', () => {
    expect(formatPinyin('Zhong1')).toBe('Zhōng')
  })

  it('formats multi-syllable', () => {
    expect(formatPinyin('ni3 hao3')).toBe('nǐ hǎo')
  })
})

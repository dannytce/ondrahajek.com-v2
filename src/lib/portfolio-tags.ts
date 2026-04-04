import type { Locale } from '~/i18n'
import tagLabels from '~/data/portfolio-tag-labels.json'

export type TagLabelPair = { cs: string; en: string }

/** Split Dato `tags` string (canonical keys): `#`, `;`, or single value. */
export function splitPortfolioTags(
  raw: string | null | undefined
): string[] {
  const str = raw?.trim()
  if (!str) return []
  if (str.includes('#'))
    return str
      .split(/#+/)
      .map((s) => s.trim())
      .filter(Boolean)
  if (str.includes(';'))
    return str
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
  return [str]
}

function getLabelForKey(key: string): TagLabelPair | undefined {
  return (tagLabels as Record<string, TagLabelPair>)[key]
}

function formatKeyAsFallback(key: string): string {
  if (key.includes('-') && !key.includes(' ')) {
    return key.replace(/-/g, ' ')
  }
  return key
}

/** Localized label for each canonical tag key. */
export function resolveTagDisplayForLocale(
  keys: string[],
  locale: Locale
): string[] {
  const primary: 'cs' | 'en' = locale === 'cs' ? 'cs' : 'en'
  const fallback: 'cs' | 'en' = primary === 'cs' ? 'en' : 'cs'
  return keys.map((k) => {
    const row = getLabelForKey(k)
    if (row) {
      const v = row[primary] || row[fallback]
      return v || formatKeyAsFallback(k)
    }
    return formatKeyAsFallback(k)
  })
}

/** Text for client-side portfolio search (keys + mapped CS/EN labels). */
export function buildTagsSearchBlob(tags: string | null | undefined): string {
  const parts: string[] = []
  const s = tags?.trim()
  if (!s) {
    return ''
  }
  const keys = splitPortfolioTags(s)
  for (const k of keys) {
    const row = getLabelForKey(k)
    if (row) {
      parts.push(row.cs, row.en)
    }
    parts.push(k.replace(/-/g, ' '), k)
  }
  return parts.join(' ')
}

/** Detail page: map `tags` string + JSON labels for locale. */
export function resolvePortfolioDetailTagLabels(input: {
  tags?: string | null
  locale: Locale
}): string[] {
  const { tags, locale } = input
  const tl = tags?.trim()
  if (!tl) {
    return []
  }
  return resolveTagDisplayForLocale(splitPortfolioTags(tl), locale)
}

/**
 * Video URL normalization + Tier 2 title similarity for portfolio CSV → Dato matching.
 */

/** e.g. `youtube:dQw4w9WgXcQ` | `vimeo:123456789` */
export type VideoKey = string

export const SIMILARITY_THRESHOLD = 0.85
export const AMBIGUITY_DELTA = 0.05
export const YEAR_BOOST = 0.05

/** ASCII slug — aligned with import-clients-locations-tags. */
export function slugifyAscii(input: string): string {
  const s = input
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'x'
}

/** Stable embed URL for Dato `video` string field. */
export function normalizeVideoEmbedUrl(url: string): string | null {
  const key = parseVideoKey(url)
  if (!key) {
    return null
  }
  if (key.startsWith('youtube:')) {
    const id = key.slice('youtube:'.length)
    return `https://www.youtube.com/embed/${id}`
  }
  if (key.startsWith('vimeo:')) {
    const id = key.slice('vimeo:'.length)
    return `https://player.vimeo.com/video/${id}`
  }
  return null
}

/**
 * Canonical video key from any YouTube/Vimeo URL or embed string.
 * Returns null if host is not YouTube/Vimeo or id cannot be parsed.
 */
export function parseVideoKey(url: string): VideoKey | null {
  const trimmed = url?.trim()
  if (!trimmed) {
    return null
  }
  try {
    const u = new URL(trimmed, 'https://example.com')
    const host = u.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]?.split('?')[0]
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return `youtube:${id}`
      }
      return null
    }

    if (host.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) {
        const id = u.pathname.split('/').filter(Boolean)[1]
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
          return `youtube:${id}`
        }
      }
      const v = u.searchParams.get('v')
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return `youtube:${v}`
      }
      return null
    }

    if (host.includes('vimeo.com')) {
      const parts = u.pathname.split('/').filter(Boolean)
      const last = parts[parts.length - 1]
      if (last && /^\d+$/.test(last)) {
        return `vimeo:${last}`
      }
      return null
    }

    return null
  } catch {
    return null
  }
}

export function normalizeTitleForCompare(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) {
    return n
  }
  if (n === 0) {
    return m
  }
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur = new Array<number>(n + 1)
    cur[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + cost
      )
    }
    prev = cur
  }
  return prev[n]!
}

/** 0–1 similarity from Levenshtein ratio. */
export function stringSimilarity(a: string, b: string): number {
  const x = normalizeTitleForCompare(a)
  const y = normalizeTitleForCompare(b)
  if (!x && !y) {
    return 1
  }
  if (!x || !y) {
    return 0
  }
  if (x === y) {
    return 1
  }
  if (x.includes(y) || y.includes(x)) {
    return 0.95
  }
  const d = levenshtein(x, y)
  const maxLen = Math.max(x.length, y.length)
  return maxLen === 0 ? 1 : 1 - d / maxLen
}

export function bestTitleScore(
  csvCs: string,
  csvEn: string,
  datoCs: string,
  datoEn: string,
  datoFallback: string
): number {
  const pairs: Array<[string, string]> = [
    [csvCs, datoCs],
    [csvCs, datoEn],
    [csvEn, datoCs],
    [csvEn, datoEn],
    [csvCs, datoFallback],
    [csvEn, datoFallback],
  ]
  let best = 0
  for (const [a, b] of pairs) {
    if (!a?.trim() || !b?.trim()) {
      continue
    }
    best = Math.max(best, stringSimilarity(a, b))
  }
  return best
}

export function pickTier2Match(
  candidates: Array<{ id: string; score: number }>,
  threshold: number = SIMILARITY_THRESHOLD,
  delta: number = AMBIGUITY_DELTA
): { kind: 'ok'; id: string; score: number } | { kind: 'none' } | { kind: 'ambiguous'; ids: string[]; scores: number[] } {
  const sorted = [...candidates].sort((a, b) => b.score - a.score)
  const best = sorted[0]
  if (!best || best.score < threshold) {
    return { kind: 'none' }
  }
  const second = sorted[1]
  if (
    second &&
    second.score >= threshold &&
    second.score >= best.score - delta
  ) {
    return {
      kind: 'ambiguous',
      ids: [best.id, second.id],
      scores: [best.score, second.score],
    }
  }
  return { kind: 'ok', id: best.id, score: best.score }
}

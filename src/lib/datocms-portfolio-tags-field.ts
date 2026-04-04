/**
 * Portfolio **Single-line string** field for semicolon-separated tag keys (`portfolio-tag-labels.json`).
 * Default `tags` (matches Dato after replacing Tag links with a string field).
 */
export const PORTFOLIO_TAGS_FIELD =
  (import.meta.env.DATOCMS_PORTFOLIO_TAGS_FIELD as string | undefined)?.trim() ||
  'tags'

export function readTagsStringFromRecord(
  raw: Record<string, unknown>
): string | null {
  const v = raw[PORTFOLIO_TAGS_FIELD]
  if (v == null || v === '') {
    return null
  }
  return typeof v === 'string' ? v : null
}

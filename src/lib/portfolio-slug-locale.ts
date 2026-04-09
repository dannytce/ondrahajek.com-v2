import type { Locale } from '~/i18n'

/** Resolve DatoCMS localized portfolio slug for the active locale (with fallback). */
export function portfolioSlugForLocale(
  row: { slugEn: string | null; slugCs: string | null },
  locale: Locale
): string | null {
  const en = row.slugEn?.trim() ?? ''
  const cs = row.slugCs?.trim() ?? ''
  if (locale === 'cs') return cs || en || null
  return en || cs || null
}

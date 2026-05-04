/**
 * Typography-only presets for `<Heading />`: font, size, weight, leading, tracking, case.
 * Margins, max-width, flex, colors, and decorative hooks belong on the component via `class`.
 *
 * | `size` | Typical use |
 * |--------|---------------|
 * | `display` | Largest fluid marketing line |
 * | `hero` | Default hero headline |
 * | `title-xl` | Large in-page H1 |
 * | `title-2xl` | Extra-large headline |
 * | `title-fluid` | Responsive multi-breakpoint headline |
 * | `subtitle` | Section titles that scale up on `md` |
 * | `subtitle-compact` | Shorter toolbar-style paired lines |
 * | `ui-title` | Compact UI surfaces (dialogs, drawers) |
 * | `eyebrow` | Small uppercase label |
 * | `meta` | Geist caption / secondary line |
 */
export const headingTypography = {
  display:
    'font-anton text-[clamp(3rem,9vw,9.6rem)] uppercase leading-[1.06] tracking-[0.02em]',
  hero: 'font-anton uppercase leading-[0.95] text-[3.4rem] md:text-[5rem]',
  'title-xl': 'font-anton font-semibold uppercase text-[4rem] md:text-[6rem]',
  'title-2xl':
    'font-anton font-semibold uppercase leading-[0.95] text-[5rem] md:text-[6rem]',
  'title-fluid':
    'font-anton uppercase leading-[0.92] tracking-[0.01em] text-[3.8rem] md:text-[7.2rem] lg:text-[4.2rem] xl:text-[4.8rem]',
  subtitle: 'font-anton text-[3.2rem] md:text-[5rem]',
  'subtitle-compact':
    'font-anton leading-[1.08] text-[3.2rem] md:text-[3.6rem]',
  'ui-title': 'font-anton uppercase tracking-wide text-[2.4rem]',
  eyebrow: 'font-anton text-[1.6rem] font-semibold uppercase leading-10',
  meta: 'font-geist text-[1rem] font-normal uppercase leading-tight tracking-[0.2em] md:text-[1.1rem]',
} as const

export type HeadingLevel = 1 | 2 | 3 | 4

export type HeadingSize = keyof typeof headingTypography

export function headingTypeClass(size: HeadingSize): string {
  return headingTypography[size]
}

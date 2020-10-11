import { ScreenSize } from './variables'

export const mq = {
  phoneSmall: `@media (min-width: ${ScreenSize.XS / 16}em)`,
  phone: `@media (min-width: ${ScreenSize.SM / 16}em)`,
  tablet: `@media (min-width: ${ScreenSize.MD / 16}em)`,
  desktop: `@media (min-width: ${ScreenSize.D / 16}em)`,
  desktopWide: `@media (min-width: ${ScreenSize.XL + 30 / 16}em)`,
}

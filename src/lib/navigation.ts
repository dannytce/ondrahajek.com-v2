import { t, localePath, type Locale } from '~/i18n'
import { localizedPagePath } from '~/i18n/routes'

export interface NavLink {
  text: string
  link: string
}

export function getNavLinks(locale: Locale): NavLink[] {
  return [
    {
      text: t(locale, 'nav.drone'),
      link: localePath(locale, localizedPagePath(locale, 'drone')),
    },
    {
      text: t(locale, 'nav.video'),
      link: localePath(locale, localizedPagePath(locale, 'video')),
    },
    {
      text: t(locale, 'nav.gallery'),
      link: localePath(locale, localizedPagePath(locale, 'gallery')),
    },
    {
      text: t(locale, 'nav.about'),
      link: localePath(locale, localizedPagePath(locale, 'about')),
    },
  ]
}

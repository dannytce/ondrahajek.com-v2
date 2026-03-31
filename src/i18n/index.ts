export const LOCALES = ['en', 'cs'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}

export function getLocaleFromParam(param: string | undefined): Locale {
  if (param && isLocale(param)) return param
  return DEFAULT_LOCALE
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'en' ? 'cs' : 'en'
}

export function localePath(locale: Locale, path: string = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `/${locale}${clean === '/' ? '' : clean}`
}

/** Build the alternate URL for hreflang tags. */
export function getAlternateUrl(locale: Locale, path: string): string {
  const alt = getAlternateLocale(locale)
  return localePath(alt, path)
}

/** Category slug → DatoCMS category ID mapping */
export const CATEGORY_IDS = {
  'drone-cinematography': 'EBVBwMDdRCOpARMhmTbKaQ',
  'video-production': 'VT_hYWUxT_azpSM3sVsgOQ',
  'selected-work': 'MB-MnGx_RlWwUyXvE4LNPQ',
} as const

export type CategorySlug = keyof typeof CATEGORY_IDS

/** Map category ID back to its route slug */
export function getCategorySlug(categoryId: string): CategorySlug | null {
  for (const [slug, id] of Object.entries(CATEGORY_IDS)) {
    if (id === categoryId) return slug as CategorySlug
  }
  return null
}

export const translations = {
  en: {
    // Nav
    'nav.drone': 'Drone Cinematography',
    'nav.video': 'Video Production',
    'nav.gallery': 'Gallery',
    'nav.about': 'About',

    // Homepage
    'home.title': 'Aerial',
    'home.subtitle': 'Video & Photography',
    'home.featured': 'Selected Work',
    'home.viewAll': 'View all',

    // Category pages
    'category.drone.title': 'Drone Cinematography',
    'category.drone.description': 'Aerial drone cinematography portfolio by Ondra Hajek',
    'category.video.title': 'Video Production',
    'category.video.description': 'Video production portfolio by Ondra Hajek',

    // Filters
    'filter.all': 'All',
    'filter.year': 'Year',
    'filter.location': 'Location',
    'filter.search': 'Search...',
    'filter.clear': 'Clear filters',
    'filter.results': 'results',
    'filter.noResults': 'No projects match your filters.',

    // Detail
    'detail.back': '← Back to portfolio',
    'detail.backTo': '← Back to',
    'detail.year': 'Year',
    'detail.client': 'Client',
    'detail.location': 'Location',
    'detail.description': 'Description',
    'detail.tags': 'Tags',

    // Language
    'lang.switch': 'Česky',
    'lang.current': 'EN',

    // Meta
    'meta.title': 'ondrahajek.com | AERIAL Video & Photography',
    'meta.description':
      'Web portfolio of drone pilot Ondra Hajek, who will make your projects more interesting. He specialises in documentaries, film, music video, commercials and architecture.',
  },
  cs: {
    'nav.drone': 'Letecká Kinematografie',
    'nav.video': 'Video Produkce',
    'nav.gallery': 'Galerie',
    'nav.about': 'O mně',

    'home.title': 'Aerial',
    'home.subtitle': 'Video & Photography',
    'home.featured': 'Vybrané Práce',
    'home.viewAll': 'Zobrazit vše',

    'category.drone.title': 'Letecká Kinematografie',
    'category.drone.description': 'Portfolio letecké kinematografie od Ondry Hajka',
    'category.video.title': 'Video Produkce',
    'category.video.description': 'Portfolio video produkce od Ondry Hajka',

    'filter.all': 'Vše',
    'filter.year': 'Rok',
    'filter.location': 'Lokace',
    'filter.search': 'Hledat...',
    'filter.clear': 'Vymazat filtry',
    'filter.results': 'výsledků',
    'filter.noResults': 'Žádné projekty neodpovídají filtrům.',

    'detail.back': '← Zpět na portfolio',
    'detail.backTo': '← Zpět na',
    'detail.year': 'Rok',
    'detail.client': 'Klient',
    'detail.location': 'Lokace',
    'detail.description': 'Popis',
    'detail.tags': 'Štítky',

    'lang.switch': 'English',
    'lang.current': 'CZ',

    'meta.title': 'ondrahajek.com | AERIAL Video & Fotografie',
    'meta.description':
      'Portfolio pilota dronů Ondry Hajka, který vaše projekty udělá zajímavějšími. Specializuje se na dokumenty, film, hudební klipy, reklamy a architekturu.',
  },
} as const

export type TranslationKey = keyof (typeof translations)['en']

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.en[key] ?? key
}

/** Generate static paths for locales (used in getStaticPaths). */
export function localeStaticPaths() {
  return LOCALES.map((locale) => ({ params: { locale } }))
}

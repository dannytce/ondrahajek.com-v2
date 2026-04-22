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
    'header.homepageAriaLabel': 'Ondrahajek homepage',
    'header.menuToggleAriaLabel': 'Toggle menu',

    // Homepage
    'home.title': 'Aerial',
    'home.subtitle': 'Drone Cinematography & Video Production',
    'home.heroBrand': 'Ondra Hajek',
    'home.heroLine': 'Drone\ncinematography\n& video production',
    'home.heroLineDesktop': 'Drone cinematography\n& video production',
    'home.heroTagline': '12 years of experience',
    'home.heroDescriptor':
      'Filming for global brands and commercial campaigns with a maximum focus on detail, creativity, and safety. Providing full-service video production—from initial concept and scripting to professional filming, editing, and color grading.',
    'home.featured': 'Selected Work',
    'home.projectsLabel': 'projects',

    // Hire CTA
    'hire.open': 'Hire for project',
    'hire.title': 'Start a project',
    'hire.body':
      'Tell us about your production — we reply quickly with availability and next steps.',
    'hire.emailLabel': 'Email',
    'hire.phoneLabel': 'Phone',
    'hire.close': 'Close',

    // Category pages
    'category.drone.title': 'Drone Cinematography',
    'category.drone.intro':
      "Specializing in professional drone cinematography, I deliver high-end aerial video production for commercial, corporate, and creative projects-focusing on advertising, real estate, architecture, and construction. With 10+ years of experience filming for brands worldwide, I combine technical precision with a creative, human touch. As a fully licensed pilot, I guarantee safe operations in any environment. Let's elevate your visual storytelling from dynamic wide-angle shots to stunning bird's-eye details.",
    'category.drone.description':
      'Aerial drone cinematography portfolio by Ondra Hajek',
    'category.video.title': 'Video Production',
    'category.video.intro':
      'I provide full-service video production-from the initial concept to the final delivery. I create visually engaging corporate videos, commercials, event videos, and modern social media content with one clear goal: to effectively communicate your story and elevate your brand. I manage the entire video creation process, including pre-production, directing, filming, and precise post-production with advanced color grading. For larger-scale projects, I assemble a trusted team of industry professionals to ensure high-end quality without compromise. The result is content that not only looks stunning but, more importantly, drives results and engages the right audience.',
    'category.video.description': 'Video production portfolio by Ondra Hajek',
    'category.video.seoTitleLocation':
      'Video Production in {location} · {siteTitle}',
    'category.video.seoTitleClient':
      'Video Production for {client} · {siteTitle}',
    'category.video.seoTitleLocationClient':
      'Video Production in {location} · {client} · {siteTitle}',
    'category.video.seoDescLocation':
      'Video production work in {location} — portfolio by Ondra Hajek.',
    'category.video.seoDescClient':
      'Video production for {client} — portfolio by Ondra Hajek.',
    'category.video.seoDescLocationClient':
      'Video production in {location} for {client} — portfolio by Ondra Hajek.',
    'category.video.seoTitleFiltered': 'Video Production · {siteTitle}',
    'category.video.seoDescFiltered':
      'Filtered video production portfolio by Ondra Hajek.',

    'category.drone.seoTitleLocation':
      'Drone Cinematography in {location} · {siteTitle}',
    'category.drone.seoTitleClient':
      'Drone Cinematography for {client} · {siteTitle}',
    'category.drone.seoTitleLocationClient':
      'Drone Cinematography in {location} · {client} · {siteTitle}',
    'category.drone.seoDescLocation':
      'Aerial drone cinematography in {location} — portfolio by Ondra Hajek.',
    'category.drone.seoDescClient':
      'Drone cinematography for {client} — portfolio by Ondra Hajek.',
    'category.drone.seoDescLocationClient':
      'Drone cinematography in {location} for {client} — portfolio by Ondra Hajek.',
    'category.drone.seoTitleFiltered': 'Drone Cinematography · {siteTitle}',
    'category.drone.seoDescFiltered':
      'Filtered aerial drone cinematography portfolio by Ondra Hajek.',

    // Filters
    'filter.all': 'All',
    'filter.year': 'Year',
    'filter.location': 'Location',
    'filter.client': 'Client',
    'filter.search': 'Search...',
    'filter.clear': 'Clear filters',
    'filter.results': 'results',
    'filter.noResults': 'No projects match your filters.',
    'filter.toggleFilters': 'Show or hide filters',
    'filter.refine': 'Refine',
    'filter.project.one': 'project',
    'filter.project.few': 'projects',
    'filter.project.other': 'projects',

    // Detail
    'detail.back': '← Back to portfolio',
    'detail.backTo': '← Back to',
    'detail.year': 'Year',
    'detail.client': 'Client',
    'detail.location': 'Location',
    'detail.moreInLocation': 'More work in {location}',
    'detail.moreForClient': 'More for {client}',
    'detail.description': 'Description',
    'detail.tags': 'Tags',
    'detail.share': 'Share',
    'detail.linkCopied': 'Link copied',
    'detail.getInTouch': 'Get in Touch',
    'detail.videoTitleFallback': 'Video',

    // Language
    'lang.switch': 'Česky',
    'lang.current': 'EN',

    // Meta
    'meta.title': 'ondrahajek.com | AERIAL Video & Photography',
    'meta.description':
      'Web portfolio of drone pilot Ondra Hajek, who will make your projects more interesting. He specialises in documentaries, film, music video, commercials and architecture.',

    // Footer
    'footer.tagline': 'Aerial Video & Photography',
    'footer.work': 'Work',
    'footer.info': 'Info',
    'footer.contact': 'Contact',
    'footer.mobile.drone': 'Drone',
    'footer.mobile.video': 'Video',
    'footer.mobile.gallery': 'Gallery',
    'footer.mobile.about': 'About',
    'footer.social.linkedin': 'LinkedIn',
    'footer.social.instagram': 'Instagram',
    'footer.social.vimeo': 'Vimeo',
    'about.credentials.title': 'Credentials',
    'about.credentials.phoneLabel': 'Tel.:',
    'about.credentials.licenseText':
      'Holder of the permit for aerial work operations issued by the Civil Aviation Authority.',
  },
  cs: {
    'nav.drone': 'Letecké záběry dronem',
    'nav.video': 'Video Produkce',
    'nav.gallery': 'Galerie',
    'nav.about': 'O mně',
    'header.homepageAriaLabel': 'Domovská stránka Ondrahajek',
    'header.menuToggleAriaLabel': 'Přepnout menu',

    'home.title': 'Aerial',
    'home.subtitle': 'Letecké záběry dronem & videoprodukce',
    'home.heroBrand': 'Ondra Hajek',
    'home.heroLine': 'Letecké\nzáběry dronem\n& videoprodukce',
    'home.heroLineDesktop': 'Letecké záběry\ndronem & videoprodukce',
    'home.heroTagline': '12 let zkušeností',
    'home.heroDescriptor':
      'Natáčím pro světové značky a reklamní kampaně s maximálním důrazem na detail, kreativitu a bezpečnost. Zajišťuji kompletní realizaci video projektů na klíč – od prvotního nápadu a scénáře přes profesionální natáčení až po finální střih a color grading.',
    'home.featured': 'Vybrané práce',
    'home.projectsLabel': 'projektů',

    'hire.open': 'Zakázka / kontakt',
    'hire.title': 'Nový projekt',
    'hire.body':
      'Napište nám o produkci — ozveme se s dostupností a dalšími kroky.',
    'hire.emailLabel': 'E-mail',
    'hire.phoneLabel': 'Telefon',
    'hire.close': 'Zavřít',

    'category.drone.title': 'Letecké záběry dronem',
    'category.drone.intro':
      'Poskytuji profesionální letecké záběry dronem pro komerční, firemní i kreativní projekty v oblasti reklamy, realit, architektury či stavebnictví. Mám přes 10 let zkušeností a s dronem jsem natáčel pro desítky značek po celém světě. Jako licencovaný pilot zaručuji maximální bezpečnost a preciznost i v náročných podmínkách. Vaší prezentaci dodám kreativní filmové záběry na míru s osobním a lidským přesahem - od dynamických celků až po detaily z ptačí perspektivy.',
    'category.drone.description':
      'Portfolio letecké kinematografie od Ondry Hajka',
    'category.video.title': 'Video Produkce',
    'category.video.intro':
      'Zajišťuji profesionální video produkci na klíč - od úvodního konceptu až po finální export. Tvořím vizuálně poutavá firemní videa, reklamní kampaně, eventová videa i moderní obsah pro sociální sítě s jediným cílem: efektivně odkomunikovat váš příběh a posílit vaši značku. Řídím kompletní proces tvorby videa. Postarám se o přípravu, režii, natáčení i precizní postprodukci včetně pokročilého color gradingu. Pro rozsáhlejší projekty sestavuji tým ověřených profesionálů, díky čemuž dodávám špičkovou kvalitu bez kompromisů. Výsledkem je obsah, který nejen skvěle vypadá, ale hlavně funguje a osloví to správné publikum.',
    'category.video.description': 'Portfolio video produkce od Ondry Hajka',
    'category.video.seoTitleLocation':
      'Video produkce v lokalitě {location} · {siteTitle}',
    'category.video.seoTitleClient':
      'Video produkce pro {client} · {siteTitle}',
    'category.video.seoTitleLocationClient':
      'Video produkce v lokalitě {location} · {client} · {siteTitle}',
    'category.video.seoDescLocation':
      'Video produkce v lokalitě {location} — portfolio Ondry Hajka.',
    'category.video.seoDescClient':
      'Video produkce pro klienta {client} — portfolio Ondry Hajka.',
    'category.video.seoDescLocationClient':
      'Video produkce v lokalitě {location} pro {client} — portfolio Ondry Hajka.',
    'category.video.seoTitleFiltered': 'Video produkce · {siteTitle}',
    'category.video.seoDescFiltered':
      'Filtrované portfolio video produkce od Ondry Hajka.',

    'category.drone.seoTitleLocation':
      'Letecká kinematografie v lokalitě {location} · {siteTitle}',
    'category.drone.seoTitleClient':
      'Letecká kinematografie pro {client} · {siteTitle}',
    'category.drone.seoTitleLocationClient':
      'Letecká kinematografie v lokalitě {location} · {client} · {siteTitle}',
    'category.drone.seoDescLocation':
      'Letecká kinematografie v lokalitě {location} — portfolio Ondry Hajka.',
    'category.drone.seoDescClient':
      'Letecká kinematografie pro klienta {client} — portfolio Ondry Hajka.',
    'category.drone.seoDescLocationClient':
      'Letecká kinematografie v lokalitě {location} pro {client} — portfolio Ondry Hajka.',
    'category.drone.seoTitleFiltered': 'Letecká kinematografie · {siteTitle}',
    'category.drone.seoDescFiltered':
      'Filtrované portfolio letecké kinematografie od Ondry Hajka.',

    'filter.all': 'Vše',
    'filter.year': 'Rok',
    'filter.location': 'Lokace',
    'filter.client': 'Klient',
    'filter.search': 'Hledat...',
    'filter.clear': 'Vymazat filtry',
    'filter.results': 'výsledků',
    'filter.noResults': 'Žádné projekty neodpovídají filtrům.',
    'filter.toggleFilters': 'Zobrazit nebo skrýt filtry',
    'filter.refine': 'Upřesnit',
    'filter.project.one': 'projekt',
    'filter.project.few': 'projekty',
    'filter.project.other': 'projektů',

    'detail.back': '← Zpět na portfolio',
    'detail.backTo': '← Zpět na',
    'detail.year': 'Rok',
    'detail.client': 'Klient',
    'detail.location': 'Lokace',
    'detail.moreInLocation': 'Další práce v lokalitě {location}',
    'detail.moreForClient': 'Další práce pro {client}',
    'detail.description': 'Popis',
    'detail.tags': 'Štítky',
    'detail.share': 'Sdílet',
    'detail.linkCopied': 'Odkaz zkopírován',
    'detail.getInTouch': 'Ozvat se',
    'detail.videoTitleFallback': 'Video',

    'lang.switch': 'English',
    'lang.current': 'CZ',

    'meta.title': 'ondrahajek.com | AERIAL Video & Fotografie',
    'meta.description':
      'Portfolio pilota dronů Ondry Hajka, který vaše projekty udělá zajímavějšími. Specializuje se na dokumenty, film, hudební klipy, reklamy a architekturu.',

    'footer.tagline': 'Aerial Video & Photography',
    'footer.work': 'Práce',
    'footer.info': 'Info',
    'footer.contact': 'Kontakt',
    'footer.mobile.drone': 'Dron',
    'footer.mobile.video': 'Video',
    'footer.mobile.gallery': 'Galerie',
    'footer.mobile.about': 'O mně',
    'footer.social.linkedin': 'LinkedIn',
    'footer.social.instagram': 'Instagram',
    'footer.social.vimeo': 'Vimeo',
    'about.credentials.title': 'Údaje',
    'about.credentials.phoneLabel': 'Tel.:',
    'about.credentials.licenseText':
      'Držitel povolení k provozování leteckých prací od Úřadu pro civilní letectví.',
  },
} as const

export type TranslationKey = keyof (typeof translations)['en']

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.en[key] ?? key
}

export function projectCountLabel(locale: Locale, count: number): string {
  const category = new Intl.PluralRules(locale).select(count)
  if (category === 'one') return t(locale, 'filter.project.one')
  if (category === 'few') return t(locale, 'filter.project.few')
  return t(locale, 'filter.project.other')
}

/** Replace `{name}` placeholders in a string (used for SEO and detail link copy). */
export function fillTemplate(
  template: string,
  vars: Record<string, string>
): string {
  let out = template
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(v)
  }
  return out
}

/** Generate static paths for locales (used in getStaticPaths). */
export function localeStaticPaths() {
  return LOCALES.map((locale) => ({ params: { locale } }))
}

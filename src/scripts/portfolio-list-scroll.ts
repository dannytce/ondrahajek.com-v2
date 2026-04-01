/**
 * Persists scroll position when leaving the locale homepage (`/en`, `/cs`) and
 * restores it on return (same tab, View Transitions / client navigation).
 */

const PREFIX = 'portfolio-list-scroll:'

function normalizePath(pathname: string): string {
  const p = pathname.replace(/\/$/, '') || '/'
  return p
}

function isLocaleHomePath(pathname: string): boolean {
  const p = normalizePath(pathname)
  return p === '/en' || p === '/cs'
}

function storageKey(pathname: string): string {
  return PREFIX + normalizePath(pathname)
}

function onClickCapture(ev: MouseEvent): void {
  const raw = ev.target
  if (!(raw instanceof Element)) return
  const a = raw.closest('a[href]')
  if (!(a instanceof HTMLAnchorElement)) return
  if (!a.href) return
  if (a.target === '_blank' || a.hasAttribute('download')) return

  let url: URL
  try {
    url = new URL(a.href, location.href)
  } catch {
    return
  }
  if (url.origin !== location.origin) return
  if (!isLocaleHomePath(location.pathname)) return

  const here = normalizePath(location.pathname)
  const there = normalizePath(url.pathname)
  if (there === here && url.search === location.search) return

  try {
    sessionStorage.setItem(storageKey(location.pathname), String(window.scrollY))
  } catch {
    // ignore quota / private mode
  }
}

function onPageLoad(): void {
  const key = storageKey(location.pathname)
  const y = sessionStorage.getItem(key)
  if (y === null) return
  sessionStorage.removeItem(key)
  const scrollY = Number.parseInt(y, 10)
  if (!Number.isFinite(scrollY)) return
  requestAnimationFrame(() => {
    window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' })
  })
}

document.addEventListener('click', onClickCapture, true)
document.addEventListener('astro:page-load', onPageLoad)

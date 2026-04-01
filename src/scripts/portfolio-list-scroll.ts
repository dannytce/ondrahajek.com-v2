const PREFIX = 'portfolio-list-scroll:'

function storageKey(pathname: string): string {
  return PREFIX + pathname
}

function onClickCapture(ev: MouseEvent): void {
  const raw = ev.target
  if (!(raw instanceof Element)) return
  const a = raw.closest('a[href*="/portfolio/"]')
  if (!(a instanceof HTMLAnchorElement)) return
  if (!a.href) return
  let url: URL
  try {
    url = new URL(a.href, location.href)
  } catch {
    return
  }
  if (url.origin !== location.origin) return
  if (url.pathname === location.pathname) return
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

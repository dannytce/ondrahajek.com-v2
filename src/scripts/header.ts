let cleanupHeader: (() => void) | undefined

function initHeader() {
  cleanupHeader?.()

  const header = document.querySelector<HTMLElement>('[data-site-header]')
  const nav = document.querySelector<HTMLElement>('[data-site-nav]')
  const video = header?.querySelector<HTMLVideoElement>('[data-header-video]')

  if (!header || !nav) {
    cleanupHeader = undefined
    return
  }

  let lastScrollY = window.scrollY
  let hasScrolled = false
  let ticking = false

  const updateNav = () => {
    const currentScrollY = window.scrollY
    const topThreshold = 80
    const scrollThreshold = 40

    if (!hasScrolled) {
      hasScrolled = true
      lastScrollY = currentScrollY
    }

    if (currentScrollY <= topThreshold) {
      nav.dataset.visible = 'true'
      lastScrollY = currentScrollY
    } else {
      const delta = currentScrollY - lastScrollY

      if (delta > scrollThreshold) {
        nav.dataset.visible = 'false'
        lastScrollY = currentScrollY
      } else if (delta < -scrollThreshold) {
        nav.dataset.visible = 'true'
        lastScrollY = currentScrollY
      }
    }

    nav.dataset.pastHero =
      currentScrollY >= window.innerHeight * 0.9 ? 'true' : 'false'
  }

  const onScroll = () => {
    if (ticking) return

    ticking = true
    window.requestAnimationFrame(() => {
      updateNav()
      ticking = false
    })
  }

  const onResize = () => updateNav()
  const onCanPlay = () => {
    header.dataset.videoReady = 'true'
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  video?.addEventListener('canplay', onCanPlay, { once: true })

  if (video && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    header.dataset.videoReady = 'true'
  }

  updateNav()

  cleanupHeader = () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    video?.removeEventListener('canplay', onCanPlay)
  }
}

document.addEventListener('astro:page-load', initHeader)
if (document.readyState !== 'loading') {
  initHeader()
} else {
  document.addEventListener('DOMContentLoaded', initHeader, { once: true })
}

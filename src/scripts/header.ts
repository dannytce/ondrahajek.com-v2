let cleanupHeader: (() => void) | undefined

function initHeader() {
  cleanupHeader?.()

  const nav = document.querySelector<HTMLElement>('[data-site-nav]')
  const menuToggle = document.querySelector<HTMLButtonElement>('[data-mobile-menu-toggle]')
  const mobileMenu = document.querySelector<HTMLElement>('[data-mobile-menu]')
  const menuLinks = document.querySelectorAll<HTMLElement>('[data-mobile-menu-link]')

  if (!nav) {
    cleanupHeader = undefined
    return
  }

  let lastScrollY = window.scrollY
  let hasScrolled = false
  let ticking = false
  let menuOpen = false

  const toggleMenu = () => {
    menuOpen = !menuOpen
    if (mobileMenu) {
      mobileMenu.style.opacity = menuOpen ? '1' : '0'
      mobileMenu.style.pointerEvents = menuOpen ? 'auto' : 'none'
    }
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', menuOpen ? 'true' : 'false')
    }
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }

  const closeMenu = () => {
    if (!menuOpen) return
    toggleMenu()
  }

  /** Backdrop, bg, and border only when the page is scrolled (not at scroll position 0). */
  const updatePastHeader = () => {
    nav.dataset.pastHeader = window.scrollY > 0 ? 'true' : 'false'
  }

  const updateNav = () => {
    updatePastHeader()

    if (menuOpen) return

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
  }

  const onScroll = () => {
    if (ticking) return

    ticking = true
    window.requestAnimationFrame(() => {
      updateNav()
      ticking = false
    })
  }

  const onResize = () => {
    if (ticking) return

    ticking = true
    window.requestAnimationFrame(() => {
      updateNav()
      ticking = false
    })
  }

  menuToggle?.addEventListener('click', toggleMenu)
  menuLinks.forEach((link) => link.addEventListener('click', closeMenu))
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })

  updateNav()

  cleanupHeader = () => {
    menuToggle?.removeEventListener('click', toggleMenu)
    menuLinks.forEach((link) => link.removeEventListener('click', closeMenu))
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    if (menuOpen) {
      document.body.style.overflow = ''
    }
  }
}

document.addEventListener('astro:page-load', initHeader)
if (document.readyState !== 'loading') {
  initHeader()
} else {
  document.addEventListener('DOMContentLoaded', initHeader, { once: true })
}

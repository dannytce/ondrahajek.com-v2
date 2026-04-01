function initShowreelDialogs() {
  const dialogs = document.querySelectorAll<HTMLDialogElement>(
    '[data-showreel-dialog]'
  )

  dialogs.forEach((dialog) => {
    if (dialog.dataset.bound === 'true') return

    const triggers = document.querySelectorAll<HTMLElement>(
      `[data-showreel-trigger="${dialog.id}"]`
    )
    const closeButtons = dialog.querySelectorAll<HTMLElement>(
      '[data-dialog-close]'
    )
    const iframe = dialog.querySelector<HTMLIFrameElement>(
      'iframe[data-player-src]'
    )
    const playerRoot = dialog.querySelector<HTMLElement>('[data-player-root]')

    const open = () => {
      if (iframe?.dataset.playerSrc && !iframe.src) {
        iframe.src = iframe.dataset.playerSrc
        playerRoot?.setAttribute('data-loaded', 'false')
      }
      dialog.showModal()
    }

    const close = () => {
      dialog.close()
      if (iframe) {
        iframe.removeAttribute('src')
      }
      playerRoot?.setAttribute('data-loaded', 'false')
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault()
        open()
      })
    })

    closeButtons.forEach((button) => {
      button.addEventListener('click', close)
    })

    dialog.addEventListener('click', (event) => {
      const bounds = dialog.getBoundingClientRect()
      const isInDialog =
        bounds.top <= event.clientY &&
        event.clientY <= bounds.top + bounds.height &&
        bounds.left <= event.clientX &&
        event.clientX <= bounds.left + bounds.width

      if (!isInDialog) {
        close()
      }
    })

    dialog.dataset.bound = 'true'
  })
}

document.addEventListener('astro:page-load', initShowreelDialogs)
if (document.readyState !== 'loading') {
  initShowreelDialogs()
} else {
  document.addEventListener('DOMContentLoaded', initShowreelDialogs, {
    once: true,
  })
}

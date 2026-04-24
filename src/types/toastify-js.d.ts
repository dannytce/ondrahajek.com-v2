declare module 'toastify-js' {
  interface Options {
    text?: string
    duration?: number
    close?: boolean
    gravity?: 'top' | 'bottom'
    position?: 'left' | 'center' | 'right'
    stopOnFocus?: boolean
    className?: string
    offset?: { x?: number; y?: number }
    style?: Partial<CSSStyleDeclaration>
  }

  interface ToastInstance {
    showToast(): void
    hideToast(): void
  }

  interface ToastifyStatic {
    (options?: Options): ToastInstance
    reposition(): void
  }

  const Toastify: ToastifyStatic
  export default Toastify
}

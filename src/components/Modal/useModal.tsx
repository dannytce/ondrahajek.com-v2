import { useState, MouseEvent } from 'react'

export const useModal = () => {
  const [isShown, setIsShown] = useState(false)
  const toggle = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault()
    setIsShown(!isShown)
  }

  return {
    isShown,
    toggle,
  }
}

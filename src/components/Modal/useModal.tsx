import { useState, MouseEvent } from 'react'

export const useModal = () => {
  const [isShown, setIsShown] = useState<boolean>(false)
  const toggle = (event: MouseEvent) => {
    event.preventDefault()
    setIsShown(!isShown)
  }

  return {
    isShown,
    toggle,
  }
}

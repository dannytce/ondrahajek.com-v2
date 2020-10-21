import React, { FC, useEffect, ReactElement } from 'react'
import FocusLock from 'react-focus-lock'
import ReactDOM from 'react-dom'

import {
  Wrapper,
  Header,
  StyledModal,
  HeaderText,
  CloseButton,
  Content,
  Backdrop,
} from './styled'

export { useModal } from './useModal'

function canUseDOM() {
  return !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  )
}

export interface Props {
  isOpen: boolean
  onRequestClose: (event: KeyboardEvent | MouseEvent) => void
  headerText: string
  children: () => ReactElement
}

export const Modal: FC<Props> = ({
  isOpen,
  onRequestClose,
  children,
  headerText,
}) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape' && isOpen) {
        onRequestClose(event)
      }
    }

    isOpen
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflow = 'unset')

    document.addEventListener('keydown', onKeyDown, false)
    return () => {
      document.removeEventListener('keydown', onKeyDown, false)
    }
  }, [isOpen, onRequestClose])

  const modal = (
    <>
      <Backdrop onClick={onRequestClose} />
      <FocusLock>
        <Wrapper
          aria-modal
          aria-labelledby={headerText}
          tabIndex={-1}
          role="dialog"
        >
          <StyledModal>
            <Header>
              <HeaderText>{headerText}</HeaderText>
              <CloseButton onClick={onRequestClose}>X</CloseButton>
            </Header>
            <Content>{children}</Content>
          </StyledModal>
        </Wrapper>
      </FocusLock>
    </>
  )

  if (!canUseDOM()) {
    return null
  }

  return isOpen ? ReactDOM.createPortal(modal, document.body) : null
}

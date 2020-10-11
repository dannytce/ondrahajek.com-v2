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

export interface Props {
  isOpen: boolean
  hide: () => void
  headerText: string
  children: () => ReactElement
}

export const Modal: FC<Props> = ({ isOpen, hide, children, headerText }) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape' && isOpen) {
        hide()
      }
    }

    isOpen
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflow = 'unset')

    document.addEventListener('keydown', onKeyDown, false)
    return () => {
      document.removeEventListener('keydown', onKeyDown, false)
    }
  }, [isOpen, hide])

  const modal = (
    <>
      <Backdrop onClick={hide} />
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
              <CloseButton onClick={hide}>X</CloseButton>
            </Header>
            <Content>{children}</Content>
          </StyledModal>
        </Wrapper>
      </FocusLock>
    </>
  )

  return isOpen ? ReactDOM.createPortal(modal, document.body) : null
}

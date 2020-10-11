import styled from 'styled-components'

import { zIndex } from '~/styles/variables'

export const CloseButton = styled.button`
  position: fixed;
  z-index: ${zIndex.modalCloseButton};
  height: 32px;
  width: 32px;
  right: 15px;
  top: 20px;
  padding: 0;
  background: none;
  border: 0;
  appearance: none;
  user-select: none;
  transition: 0.2s opacity;
  opacity: 0.6;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &::before,
  &::after {
    position: absolute;
    top: 0;
    left: 15px;
    content: '';
    height: 33px;
    width: 2px;
    background: #fff;
  }
  &::before {
    transform: rotate(45deg);
  }
  &::after {
    transform: rotate(-45deg);
  }
`

export const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: ${zIndex.modal};
  padding: 60px;
`
export const Backdrop = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 500;
`
export const StyledModal = styled.div``
export const Header = styled.div``
export const HeaderText = styled.div``

export const Content = styled.div``

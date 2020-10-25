import styled, { css, keyframes } from 'styled-components'

import { Container } from '~/components/Page/styled'
import { color, font, zIndex } from '~/styles/variables'

export const Wrapper = styled.div`
  position: absolute;
  width: 100%;
  bottom: 30px;
  z-index: ${zIndex.trustedBy};

  ${Container} {
    flex-wrap: wrap;
  }
`

export const Title = styled.h3`
  color: ${color.secondary};
  text-transform: uppercase;
  font-size: 1.4rem;
  ${font.regular};
  letter-spacing: 0.1em;
  margin: 0 0 1em;
  padding: 0;
`

export const List = styled.ul`
  width: 100%;
  overflow: scroll;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const fadeIn = keyframes`
  0% {
    opacity:0;
    transform: scale(0.8)
  }
  100% {
    opacity:1;
    transform: scale(1)
  }
`

function animationDelay() {
  let styles = ''

  for (let i = 0; i < 10; i += 1) {
    styles += `
       &:nth-child(${i}) {
         animation-delay: ${i * 0.09}s;
       }
     `
  }

  return css`
    ${styles}
  `
}

export const ListItem = styled.li`
  margin: 0 20px;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }

  opacity: 0;
  animation: ${fadeIn} 0.5s ease;
  animation-fill-mode: forwards;
  ${animationDelay()}
`

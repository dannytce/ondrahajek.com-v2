import styled from 'styled-components'

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

export const ListItem = styled.li`
  margin: 0 20px;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }
`

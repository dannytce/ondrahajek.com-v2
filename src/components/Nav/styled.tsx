import styled from 'styled-components'

import { mq } from '~/styles/mq'
import { Container } from '~/components/Page/styled'
import { font, zIndex } from '~/styles/variables'

export const StyledNav = styled.nav`
  position: fixed;
  width: 100%;
  left: 0;
  z-index: ${zIndex.nav};
  top: 30px;

  ${mq.tablet} {
    top: 63px;
  }

  pointer-events: none;

  ${Container} {
    display: flex;
    justify-content: space-between;
  }
`

export const List = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
`

export const ListItem = styled.li``

export const NavLink = styled.a`
  display: block;
  font-size: 2rem;
  ${font.Teko};
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  text-align: right;
  transition: 0.2s padding;
  pointer-events: all;

  &:hover {
    padding-right: 35px;
  }
`

export const LogoLink = styled.a`
  pointer-events: all;
`

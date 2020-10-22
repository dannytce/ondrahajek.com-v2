import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { Container } from '~/components/Page/styled'

import NavShadow from './components/NavShadow'
import { StyledNav, List, ListItem, NavLink, LogoLink } from './styled'

const navLinks = [
  { text: 'Portfolio', link: '/#portfolio' },
  { text: 'Gallery', link: '/gallery' },
  { text: 'About', link: '/about' },
]

export const Nav = () => {
  const router = useRouter()

  return (
    <StyledNav>
      <Container>
        <Link href="/">
          <LogoLink href="/">
            <img src="/logo-ondrahajek.svg" alt="Ondra Hajek" />
          </LogoLink>
        </Link>

        <List>
          {navLinks.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ListItem key={index}>
              <Link href={item.link}>
                <NavLink
                  href={item.link}
                  className={router.pathname === item.link ? 'active' : null}
                >
                  {item.text}
                </NavLink>
              </Link>
            </ListItem>
          ))}
        </List>
      </Container>
      <NavShadow />
    </StyledNav>
  )
}

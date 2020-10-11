import React from 'react'

import { FooterLink } from './FooterLink'
import { StyledFooter } from './styled'

const FooterLinks = [
  {
    title: 'Go and see the',
    name: 'Gallery',
    link: '/gallery',
  },
  {
    title: 'Read something',
    name: 'About me',
    link: '/about',
  },
  {
    title: 'Check out my',
    name: 'Portfolio',
    link: '/',
  },
  {
    title: 'Hit me up on',
    name: 'info',
    email: 'info@ondrahajek.com',
    phone: '+420 773 604 400',
  },
]

export const Footer = () => (
  <StyledFooter>
    {FooterLinks.map((item, index) => (
      <FooterLink
        key={index} // eslint-disable-line react/no-array-index-key
        {...item}
      />
    ))}
  </StyledFooter>
)

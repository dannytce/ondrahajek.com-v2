import React, { FC } from 'react'
import Link from 'next/link'

import {
  StyledWrapper,
  StyledLink,
  StyledName,
  Title,
  A,
  StyledEmail,
  StyledPhone,
} from './styled'

type Props = {
  title?: string
  name?: string
  link?: string
  email?: string
  phone?: string
}

export const FooterLink: FC<Props> = ({ link, title, name, email, phone }) => {
  if (link) {
    return (
      <Link href={link} passHref>
        <StyledLink href={link}>{name}</StyledLink>
      </Link>
    )
  }

  if (email && phone) {
    return (
      <StyledWrapper>
        <Title>{title}</Title>
        <A href={email ? `mailto:${email}` : link}>
          <StyledName>
            {name}
            <StyledEmail email={email} />
          </StyledName>
        </A>
        <StyledPhone href={`tel:${phone}`}>{phone}</StyledPhone>
      </StyledWrapper>
    )
  }

  return null
}

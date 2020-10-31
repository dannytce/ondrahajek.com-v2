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
  const LinkComponent: FC = (props) => (
    <Link href={link} passHref>
      <StyledLink href={link}>{props.children}</StyledLink>
    </Link>
  )

  const NameComponent: FC = (props) => (
    <A href={email ? `mailto:${email}` : link}>
      <StyledName>{props.children}</StyledName>
    </A>
  )

  const Wrapper = link ? LinkComponent : StyledWrapper
  const Name = email ? NameComponent : StyledName

  return (
    <Wrapper>
      <Title>{title}</Title>
      <Name href={link}>
        {name}
        {email && <StyledEmail email={email} />}
      </Name>
      {phone && <StyledPhone href={`tel:${phone}`}>{phone}</StyledPhone>}
    </Wrapper>
  )
}

import React from 'react'
import styled from 'styled-components'

import { Container } from '~/components/Page/styled'
import { mq } from '~/styles/mq'
import { color, font } from '~/styles/variables'

const Footer = styled(Container)`
  padding: 100px 0 125px;

  ${mq.tablet} {
    padding: 50px 0 0;
    height: 80vh;
    display: flex;
    margin-top: 100px;
  }
`

export const StyledFooter = Footer.withComponent('footer')

// FooterLink
export const StyledWrapper = styled.div`
  height: 155px;
  ${mq.tablet} {
    height: 100%;
  }

  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
`

export const StyledName = styled.h3`
  margin: 0;
  padding: 0;
`

export const Title = styled.p`
  padding: 0;
  margin: 0 0 20px;
  color: ${color.secondary};
  ${font.Montserrat};
  text-transform: none;
  font-size: 1.8rem;
`

export const A = styled.a`
  font-size: 4rem;
  line-height: 24px;
  text-decoration: none;
  text-transform: uppercase;
  color: #fff;
  ${font.Teko};
`

const LinkComponent = StyledWrapper.withComponent(A)

export const StyledLink = styled(LinkComponent)`
  ${mq.tablet} {
    display: flex;
    transition: 0.2s background;

    &:nth-child(2) {
      background: #111114;
    }

    &:hover {
      background: #17171a;
    }
  }
`

export const StyledEmail = styled(({ email, ...rest }) => (
  <span {...rest}>@{email.split('@')[1]}</span>
))`
  display: block;
  font-size: 2rem;
`

export const StyledPhone = styled.a`
  ${font.Teko};
  text-decoration: none;
  color: ${color.secondary};
  font-size: 2rem;
`

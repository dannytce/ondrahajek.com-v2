import styled from 'styled-components'

import { mq } from '~/styles/mq'
import { color, font } from '~/styles/variables'
import { Container } from '~/components/Page/styled'

export const Wrapper = styled(Container)`
  max-width: 1077px;
`

export const Figure = styled.figure`
  margin: 50px 0 0;
`

export const Figcaption = styled.figcaption`
  font-size: 3rem;
  ${mq.phone} {
    font-size: 3.4rem;
  }
  ${mq.tablet} {
    font-size: 3.8rem;
  }
  ${mq.desktop} {
    font-size: 4rem;
  }

  ${font.Teko};
  color: ${color.primary};
  margin: -0.45em 0 0 20px;
  line-height: 1;
  text-transform: uppercase;
`

export const Img = styled.img`
  width: 100%;
`

export const Description = styled.span`
  color: ${color.secondary};
  font-size: 1.6rem;
  ${mq.tablet} {
    font-size: 1.8rem;
  }

  margin-left: 20px;
`

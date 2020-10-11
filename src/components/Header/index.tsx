import React, { FC } from 'react'

import { Nav } from '~/components/Nav'
import { PlayShowreel } from '~/pages/home/components/PlayShowreel'
import { TrustedBy } from '~/pages/about/components/TrustedBy'
import { Container } from '~/components/Page/styled'

import {
  H1,
  H2,
  HeaderGroup,
  StyledHeader,
  Video,
  VideoContainer,
} from './styled'

type Props = {
  isAboutPage?: boolean
  isHomepage?: boolean
  title: string
  subTitle?: string
}

export const Header: FC<Props> = ({
  title,
  subTitle,
  isAboutPage,
  isHomepage,
}) => (
  <>
    <StyledHeader title={title}>
      <Container>
        {subTitle ? (
          <HeaderGroup>
            <H1>{title}</H1>
            <H2>{subTitle}</H2>
          </HeaderGroup>
        ) : (
          <H1>{title}</H1>
        )}
        {isHomepage && <PlayShowreel />}
      </Container>

      {isHomepage && (
        <VideoContainer>
          <Video poster="/header-Aerial.jpg" autoPlay loop muted>
            <source src="/bg.mp4" type="video/mp4" />
          </Video>
        </VideoContainer>
      )}
    </StyledHeader>
    {isAboutPage && <TrustedBy />}
    <Nav />
  </>
)

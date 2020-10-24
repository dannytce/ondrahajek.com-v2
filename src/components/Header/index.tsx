import React, { FC } from 'react'
import { useRouter } from 'next/router'
import { Image } from 'react-datocms'

import { Nav } from '~/components/Nav'
import { PlayShowreel } from '~/components/PlayShowreel'
import { TrustedBy } from '~/components/About/TrustedBy'
import { Container } from '~/components/Page/styled'

import {
  H1,
  H2,
  HeaderGroup,
  StyledHeader,
  BackgroundImgWrapper,
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
  headerBackground,
}) => {
  const router = useRouter()

  return (
    <>
      <StyledHeader>
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
        {headerBackground && (
          <BackgroundImgWrapper>
            <Image
              data={{
                ...headerBackground.responsiveImage,
              }}
            />
          </BackgroundImgWrapper>
        )}
      </StyledHeader>
      {isAboutPage && <TrustedBy />}
      <Nav />
    </>
  )
}

import React, { FC, useState } from 'react'
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

import { ResponsiveImage } from 'next-env'

type Props = {
  isAboutPage?: boolean
  isHomepage?: boolean
  title: string
  subTitle?: string
  headerBackground: ResponsiveImage
}

export const Header: FC<Props> = ({
  title,
  subTitle,
  isAboutPage,
  isHomepage,
  headerBackground,
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const onCanPlay = () => {
    setIsVideoLoaded(true)
  }

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
            <Video
              onCanPlay={onCanPlay}
              style={{ opacity: isVideoLoaded ? 1 : 0 }}
              autoPlay
              playsInline
              loop
              muted
            >
              <source src="/bg.mp4" type="video/mp4" />
            </Video>
          </VideoContainer>
        )}
        {headerBackground && (
          <BackgroundImgWrapper style={{ opacity: isVideoLoaded ? 0 : 1 }}>
            <Image
              data={{
                ...headerBackground,
                alt: '',
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

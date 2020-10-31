import React, { FC, MouseEvent, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Image } from 'react-datocms'

import { Modal } from '~/components/Modal'
import Player from '~/components/Player'
import { Container } from '~/components/Page/styled'
import { pageView } from '~/lib/gtag'

import {
  List,
  ListItem,
  Link,
  ImageWrapper,
  Title,
  Description,
} from './styled'

import { ResponsiveImage } from 'next-env'

type Thumbnail = {
  smartTags: string
  responsiveImage: ResponsiveImage
}

export type PortfolioType = {
  title: string
  subtitle: string
  slug: string
  thumbnail: Thumbnail
  video: string
}

type Props = {
  slug: string
  portfolios: PortfolioType[]
}

const getPortfolioDetail = (portfolios: PortfolioType[], slug: string) =>
  portfolios.find((item) => item.slug === slug)!

export const Portfolio: FC<Props> = ({ slug: incomingSlug, portfolios }) => {
  const router = useRouter()

  const [slug, setSlug] = useState(incomingSlug)

  function handleClick(event: MouseEvent) {
    event.preventDefault()

    const element = event.target as HTMLAnchorElement
    const href = element.getAttribute('href')

    if (href) {
      setSlug(href.replace('/portfolio/', ''))
      pageView(href)
      window.history.pushState({}, '', href)
    }
  }

  function handleClose() {
    router.push('/')
    setSlug('')
  }

  let portfolioDetail
  if (slug) {
    portfolioDetail = getPortfolioDetail(portfolios, slug)
  }

  return (
    <Container>
      {slug && (
        <>
          <Modal isOpen onRequestClose={handleClose}>
            <Player {...portfolioDetail} />
          </Modal>
          <Head>
            <title key="title">
              {portfolioDetail?.title} - ondrahajek.com | AERIAL Video &
              Photography
            </title>
          </Head>
        </>
      )}
      <List>
        {portfolios.map((portfolio) => (
          <ListItem key={portfolio.slug}>
            <Link href={`/portfolio/${portfolio.slug}`} onClick={handleClick}>
              <ImageWrapper>
                <Image
                  data={{
                    ...portfolio.thumbnail.responsiveImage,
                    alt: `Cover Image for ${portfolio.title}. ${portfolio.thumbnail.smartTags}`,
                  }}
                />
              </ImageWrapper>
              <Title>{portfolio.title}</Title>
              <Description>{portfolio.subtitle}</Description>
            </Link>
          </ListItem>
        ))}
      </List>
    </Container>
  )
}

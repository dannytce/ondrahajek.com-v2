import React, { FC, MouseEvent, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Image } from 'react-datocms'

import { Modal } from '~/components/Modal'
import Player from '~/components/Player'
import { Container } from '~/components/Page/styled'
import { pageView } from '~/service/analytics'
import { PortfolioRecord } from '~/api/generated/types'

import {
  List,
  ListItem,
  Link,
  ImageWrapper,
  Title,
  Description,
} from './styled'

type Props = {
  slug?: string
  portfolios: PortfolioRecord[]
}

const getPortfolioDetail = (portfolios: PortfolioRecord[], slug: string) =>
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

  let ModalComponent
  if (slug) {
    const portfolioDetail = getPortfolioDetail(portfolios, slug)

    ModalComponent = (
      <>
        <Modal isOpen onRequestClose={handleClose}>
          <Player title={portfolioDetail.title} video={portfolioDetail.video} />
        </Modal>
        <Head>
          <title key="title">
            {portfolioDetail.title} - ondrahajek.com | AERIAL Video &
            Photography
          </title>
        </Head>
      </>
    )
  }

  return (
    <Container>
      {slug ? ModalComponent : null}
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

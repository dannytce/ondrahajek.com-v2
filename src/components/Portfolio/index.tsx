import React, { FC } from 'react'
import { useRouter } from 'next/router'
import { Image } from 'react-datocms'
import NextLink from 'next/link'

import { Modal } from '~/components/Modal'
import Player from '~/components/Player'
import { Container } from '~/components/Page/styled'

import {
  List,
  ListItem,
  Link,
  ImageWrapper,
  Title,
  Description,
} from './styled'
import portfolios from './data'

const getPlayerProps = (portfolioUrl) =>
  portfolios.find((item) => item.href === portfolioUrl)

export const Portfolio = ({ isModalOpen, portfolios }) => {
  const router = useRouter()

  return (
    <Container>
      {isModalOpen && (
        <Modal isOpen onRequestClose={() => router.push('/')}>
          <Player {...getPlayerProps(portfolioUrl)} />
        </Modal>
      )}
      <List>
        {portfolios.map((portfolio) => (
          <ListItem key={portfolio.slug}>
            <NextLink
              href="/portfolio/[slug]"
              as={`/portfolio/${portfolio.slug}`}
              passHref
            >
              <Link>
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
            </NextLink>
          </ListItem>
        ))}
      </List>
    </Container>
  )
}

// export default compose(
//   withRouter,
//   withStateHandlers(
//     ({ detailId }) => ({
//       isModalOpen: boolean(detailId),
//     }),
//     {
//       openModal: () => (event) => {
//         event.preventDefault()
//         const href = event.target.getAttribute('href')

//         if (href) {
//           window.history.pushState({}, null, href)

//           return {
//             isModalOpen: true,
//             detailId: href.replace('/portfolios/', ''),
//           }
//         }
//       },
//       closeModal: (state, props) => () => {
//         props.router.push('/')

//         return { isModalOpen: false, detailId: null }
//       },
//     }
//   )
// )(Portfolio)

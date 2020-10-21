import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Image } from 'react-datocms'
import NextLink from 'next/link'

import { Modal } from '~/components/Modal'
// import Modal from '~/components/ReactModal'
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

const getPlayerProps = (portfolios, slug) =>
  portfolios.find((item) => item.slug === slug)

export const Portfolio = ({ slug, isModalOpen, portfolios }) => {
  const router = useRouter()

  // const [isOpen, setIsOpen] = useState(Boolean(slug))

  // function handleClick(event: MouseEvent) {
  //   event.preventDefault()
  // }

  return (
    <Container>
      {slug && (
        <Modal isOpen onRequestClose={() => router.push('/')}>
          <Player {...getPlayerProps(portfolios, slug)} />
        </Modal>
      )}
      <List>
        {portfolios.map((portfolio) => (
          <ListItem key={portfolio.slug}>
            <NextLink
              href={`/portfolio/${portfolio.slug}`}
              scroll={false}
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

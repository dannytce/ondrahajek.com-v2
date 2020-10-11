import React, { FC } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

import { Modal } from '~/components/Modal'
import Player from '~/components/Player'
import { Container } from '~/components/Page/styled'

import {
  List,
  ListItem,
  Link,
  Image,
  ImageWrapper,
  Title,
  Description,
} from './styled'
import portfolios from './data'

type Props = {
  openModal: void
  isModalOpen?: boolean
  portfolioUrl?: string
}

const getPlayerProps = (portfolioUrl) =>
  portfolios.find((item) => item.href === portfolioUrl)

export const Portfolio: FC<Props> = ({
  isModalOpen,
  portfolioUrl,
  openModal,
}) => {
  const router = useRouter()

  return (
    <Container>
      {isModalOpen && (
        <Modal isOpen onRequestClose={() => router.push('/')}>
          <Player {...getPlayerProps(portfolioUrl)} />
        </Modal>
      )}
      <List>
        {portfolios.map((item, key) => (
          // eslint-disable-next-line react/no-array-index-key
          <ListItem key={key}>
            <NextLink
              href={`/portfolio/${item.href}`}
              as={`/portfolio/${item.href}`}
              passHref
            >
              <Link>
                <ImageWrapper>
                  <Image
                    src={`/portfolio/${item.href}.jpg`}
                    srcSet={`/portfolio/${item.href}.jpg 1x, /portfolio/${item.href}@2x.jpg 2x`}
                    width={418}
                    height={230}
                    alt={item.title}
                  />
                </ImageWrapper>
                <Title>{item.title}</Title>
                <Description>{item.description}</Description>
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

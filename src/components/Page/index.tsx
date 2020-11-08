import React, { FC } from 'react'

import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { GlobalStyle } from '~/styles/globalStyles'
import { ResponsiveImage } from '~/api/generated/types'

import { Main } from './styled'

type Props = {
  title: string
  subTitle?: string
  isHomepage?: boolean
  isAboutPage?: boolean
  headerBackground: ResponsiveImage
}

export const Page: FC<Props> = ({
  title,
  subTitle,
  isHomepage,
  isAboutPage,
  headerBackground,
  children,
}) => (
  <>
    <GlobalStyle />
    <Header
      title={title}
      subTitle={subTitle}
      isHomepage={isHomepage}
      isAboutPage={isAboutPage}
      headerBackground={headerBackground}
    />
    <div id="modal"></div>
    <Main id={isHomepage ? 'portfolio' : undefined}>
      {children}
      <Footer />
    </Main>
  </>
)

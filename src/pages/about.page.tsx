import React from 'react'

import { Page } from '~/components/Page'
import {
  Section,
  NumbersList,
  NumbersListItem,
  List,
  ListItem,
  Credentials,
} from '~/components/About'
import { getHeaderBackgroundByPage } from '~/api'

export async function getStaticProps() {
  const headerBackground = await getHeaderBackgroundByPage('/about')

  return {
    props: {
      headerBackground,
    },
  }
}

const AboutPage = ({ headerBackground }) => (
  <Page title="About" headerBackground={headerBackground} isAboutPage>
    <Section title="Cool numbers">
      <NumbersList>
        <NumbersListItem>
          <strong>62</strong> Projects
        </NumbersListItem>
        <NumbersListItem>
          <strong>16</strong> Different countries
        </NumbersListItem>
        <NumbersListItem>
          <strong>350+</strong> Flight hours
        </NumbersListItem>
      </NumbersList>
    </Section>

    <Section title="I can help with" gray>
      <List>
        <ListItem>Documentary</ListItem>
        <ListItem>Film</ListItem>
        <ListItem>Commercial promo</ListItem>
        <ListItem>Architecture</ListItem>
        <ListItem>Music video</ListItem>
      </List>
    </Section>
    <Section title="Tech specs">
      <NumbersList>
        <NumbersListItem>
          <strong>
            4K/60<span>FPS</span>
          </strong>{' '}
          AERIAL VIDEO
        </NumbersListItem>

        <NumbersListItem>
          <strong>
            20<span>MPX</span>
          </strong>{' '}
          AERIAL PHOTOGRAPHY
        </NumbersListItem>
        <NumbersListItem>
          <strong>
            162<span>MPX</span>
          </strong>{' '}
          360° PHOTOGRAPHY
        </NumbersListItem>
      </NumbersList>
    </Section>
    <Section title="Credentials">
      <Credentials>
        <h3>ONDŘEJ HÁJEK</h3>
        Tel.: <a href="tel:+420 773 604 400">+420 773 604 400</a>
        <br />
        <a href="mailto:info@ondrahajek.com">info@ondrahajek.com</a>
        <br />
        <br />
        <h3>COPTER VISION S.R.O.</h3>
        držitel povolení k provozování leteckých prací od Úřadu pro civilní
        letectví
        <br />
        <br />
        ICO: 03803452
        <br />
        DIC: CZ03803452
      </Credentials>
    </Section>
  </Page>
)

export default AboutPage

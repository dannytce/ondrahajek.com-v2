import React, { FC } from 'react'

import { Container } from '~/components/Page/styled'

import { StyledSection, SectionContent, Title } from './styled'

type Props = {
  title: string
  gray?: boolean
}

export const Section: FC<Props> = ({ title, children, gray }) => (
  <StyledSection gray={gray}>
    <Title>{title}</Title>
    <SectionContent>
      <Container>{children}</Container>
    </SectionContent>
  </StyledSection>
)

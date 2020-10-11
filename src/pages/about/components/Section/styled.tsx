import styled, { css } from 'styled-components'

import { font } from '~/styles/variables'

export const StyledSection = styled.section<{
  gray: boolean
}>`
  height: 90vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  padding: 15vh 0 0;

  ${(props) =>
    props.gray &&
    css`
      background: #111114;
    `};
`

export const SectionContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
`

export const Title = styled.h2`
  position: relative;
  padding: 0;
  margin: 0;
  line-height: 40px;
  color: #fff;
  font-size: 1.6rem;
  ${font.Teko};
  ${font.semibold};
  text-transform: uppercase;
  z-index: 0;

  &::after {
    content: '';
    height: 40px;
    width: 20px;
    position: absolute;
    top: -2px;
    left: 50%;
    margin-left: -10px;
    background: #252528;
    z-index: -1;
  }
`

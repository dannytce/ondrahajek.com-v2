import styled from 'styled-components'

import { color, font } from '~/styles/variables'

export const Credentials = styled.div`
  color: ${color.secondary};
  max-width: 420px;
  margin: 0 auto;

  h3 {
    color: #fff;
    font-size: 4rem;
    ${font.semibold};
    ${font.Teko};
    text-transform: uppercase;
    margin: 2em 0 25px;
  }

  a {
    text-decoration: none;
    color: ${color.secondary};
  }
`

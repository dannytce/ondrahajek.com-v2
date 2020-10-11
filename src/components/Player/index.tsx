import React, { FC } from 'react'

import { Wrapper, VideoContainer, Iframe } from './styled'

type Props = {
  title: string
  src: string
}

const Player: FC<Props> = ({ title, src }) => (
  <Wrapper>
    <VideoContainer>
      <Iframe
        src={`${src}/?autoplay=1&loop=1&autopause=0`}
        title={`${title} video`}
        frameBorder="0"
        allowFullScreen
      />
    </VideoContainer>
  </Wrapper>
)

export default Player

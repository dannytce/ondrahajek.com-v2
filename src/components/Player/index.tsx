import React, { FC } from 'react'

import { Wrapper, VideoContainer, Iframe } from './styled'

type Props = {
  title: string
  video: string
}

const Player: FC<Props> = ({ title, video }) => (
  <Wrapper>
    <VideoContainer>
      <Iframe
        src={`${video}/?autoplay=1&loop=1&autopause=0`}
        title={`${title} video`}
        frameBorder="0"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    </VideoContainer>
  </Wrapper>
)

export default Player

import React, { FC } from 'react'

import { Modal, useModal } from '~/components/Modal'
import Player from '~/components/Player'

import {
  A,
  Circle,
  BeaconCircle,
  StyledPlayIcon,
  PlayShowreelWrapper,
} from './styled'

export const PlayShowreel: FC = () => {
  const { isShown, toggle } = useModal()

  return (
    <PlayShowreelWrapper>
      <A
        href="https://vimeo.com/245268560"
        onClick={toggle}
        title="Play Showreel"
      >
        Play Showreel
        <Circle>
          <BeaconCircle />
          <BeaconCircle />
          <StyledPlayIcon />
        </Circle>
      </A>
      <Modal isOpen={isShown} hide={toggle}>
        <Player
          src="https://player.vimeo.com/video/245268560"
          title="Showreel"
        />
      </Modal>
    </PlayShowreelWrapper>
  )
}

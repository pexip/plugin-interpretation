import React from 'react'

import { Button, Icon, IconTypes } from '@pexip/components'
import { useInterpretationContext } from '../../contexts/InterpretationContext/InterpretationContext'
import { capitalizeFirstLetter } from '../../utils'
import { Direction } from '../../../types/Direction'
import clsx from 'clsx'

import './MuteButton.scss'

export const MuteButton = (): JSX.Element => {
  const interpretationContext = useInterpretationContext()

  const { changeMute } = interpretationContext
  const { muted, language, direction } = interpretationContext.state

  const label = direction === Direction.MainRoomToInterpretation
    ? capitalizeFirstLetter(language?.name ?? '')
    : 'Main floor'

  return (
    <Button className={clsx('MuteButton', { muted })} data-testid='MuteButton' variant='bordered'
      onClick={() => { changeMute(!muted).catch((e) => { console.error(e) }) }}>
      <Icon source={muted ? IconTypes.IconMicrophoneOff : IconTypes.IconMicrophoneOn} />
      <span>{muted ? 'Unmute' : 'Mute'} {label}</span>
    </Button>
  )
}

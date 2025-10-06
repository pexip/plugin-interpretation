import React from 'react'
import { Button, Icon, IconTypes } from '@pexip/components'
import { useInterpretationContext } from '../../InterpretationContext/InterpretationContext'
import { capitalizeFirstLetter } from '../../utils'
import { Direction } from '../../types/Direction'
import clsx from 'clsx'
import { logger } from '../../logger'

import './MuteButton.scss'

export const MuteButton = (): React.JSX.Element => {
  const interpretationContext = useInterpretationContext()

  const { state, changeMute } = interpretationContext
  const { muted, language, direction } = state

  const label =
    direction === Direction.MainRoomToInterpretation
      ? capitalizeFirstLetter(language?.name ?? '')
      : 'Main floor'

  return (
    <Button
      className={clsx('MuteButton', { muted })}
      data-testid="MuteButton"
      variant="tertiary"
      onClick={() => {
        changeMute(!muted).catch(logger.error)
      }}
    >
      <Icon
        source={
          muted ? IconTypes.IconMicrophoneOff : IconTypes.IconMicrophoneOn
        }
      />
      <span>
        {muted ? 'Unmute' : 'Mute'} {label}
      </span>
    </Button>
  )
}

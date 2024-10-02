import React, { useEffect, useState } from 'react'
import { Button, Icon, IconTypes } from '@pexip/components'
// import { useInterpretationContext } from '../../InterpretationContext/InterpretationContext'
import { Direction } from '../../types/Direction'
import { capitalizeFirstLetter } from '../../plugin/utils'
import clsx from 'clsx'
import { EventType, IframeEvents } from '../../IframeEvents'

import './MuteButton.scss'

export const MuteButton = (): JSX.Element => {
  // const interpretationContext = useInterpretationContext()

  // const { changeMute } = interpretationContext
  // const { muted, language, direction } = interpretationContext.state
  const [muted, setMuted] = useState(false)
  const language = { code: '0034', name: 'French' }
  const direction = Direction.MainRoomToInterpretation

  const label =
    direction === Direction.MainRoomToInterpretation
      ? capitalizeFirstLetter(language?.name ?? '')
      : 'Main floor'

  const handleMuteChanged = (muted: boolean): void => {
    setMuted(muted)
  }

  useEffect(() => {
    IframeEvents.addEventListener(EventType.muteChanged, handleMuteChanged)
    return () => {
      IframeEvents.removeEventListener(EventType.muteChanged, handleMuteChanged)
    }
  }, [])

  return (
    <Button
      className={clsx('MuteButton', { muted })}
      data-testid="MuteButton"
      variant="bordered"
      onClick={() => {
        IframeEvents.sendEvent(EventType.changeMute, !muted)
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

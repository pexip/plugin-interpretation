import React, { useEffect } from 'react'
import { BaseLanguageSelector } from './BaseLanguageSelector/BaseLanguageSelector'
import { Role } from '../types/Role'
import { AdvanceLanguageSelector } from './AdvanceLanguageSelector/AdvanceLanguageSelector'
import { MuteButton } from './MuteButton/MuteButton'
import { Volume } from './Volume/Volume'
import { ConnectionState } from '../types/ConnectionState'
import { Connecting } from './Connecting/Connecting'
import { EventType, IframeEvents } from '../IframeEvents'

import './Dialog.scss'

interface DialogProps {
  role: Role
  allowChangeDirection: boolean
  showListenerMuteButton: boolean
}

export const Dialog = (props: DialogProps): JSX.Element => {
  const { role, allowChangeDirection, showListenerMuteButton } = props

  const [connectionState, setConnectionState] = React.useState(
    ConnectionState.Connecting
  )

  const handleStateChanged = (state: ConnectionState): void => {
    setConnectionState(state)
  }

  useEffect(() => {
    IframeEvents.addEventListener(
      EventType.ConnectionStateChanged,
      handleStateChanged
    )

    IframeEvents.sendEvent(EventType.RequestConnectionState)

    return () => {
      IframeEvents.removeEventListener(
        EventType.ConnectionStateChanged,
        handleStateChanged
      )
    }
  }, [])

  return (
    <div className="Dialog">
      {connectionState === ConnectionState.Connecting && <Connecting />}
      {connectionState === ConnectionState.Connected &&
        role === Role.Interpreter && (
          <>
            {allowChangeDirection && <AdvanceLanguageSelector />}
            {!allowChangeDirection && <BaseLanguageSelector />}
            <MuteButton />
          </>
        )}
      {connectionState === ConnectionState.Connected &&
        role === Role.Listener && (
          <>
            <BaseLanguageSelector />
            <Volume />
            {showListenerMuteButton && <MuteButton />}
          </>
        )}
    </div>
  )
}

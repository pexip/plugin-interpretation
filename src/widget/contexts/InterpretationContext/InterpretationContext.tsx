import React, { createContext, useContext, useMemo, useReducer } from 'react'
import type { InterpretationState } from './InterpretationState'
import { Direction } from '../../../types/Direction'
import type { Language } from '../../../types/Language'
import { interpretationReducer } from './interpretationReducer'
import { config } from '../../../config'
import { InterpretationActionType } from './InterpretationAction'
import {
  createCallSignals,
  createInfinityClient,
  createInfinityClientSignals,
  ClientCallType,
  type InfinityClient,
  type InfinitySignals,
  type CallSignals
} from '@pexip/infinity'
import { showErrorPrompt } from '../../prompts'
import { showPinForm } from '../../forms'
import { Role } from '../../../types/Role'
// import { getPlugin } from '../../../plugin'
// import { getUser } from '../../user'
// import { getMainConferenceAlias } from '../../../plugin/conference'
import { MainRoom } from '../../main-room'
// import { setButtonActive } from '../../../button'

const InterpretationContext = createContext<InterpretationContextType | null>(
  null
)

export interface InterpretationContextType {
  setPin: (pin: string) => void
  connect: (language: Language, pin?: string) => Promise<void>
  disconnect: () => Promise<void>
  changeMediaDevice: (constraints: MediaTrackConstraints) => Promise<void>
  changeLanguage: (language: Language) => Promise<void>
  changeDirection: (direction: Direction) => Promise<void>
  changeMute: (muted: boolean) => Promise<void>
  changeVolume: (volume: number) => void
  minimize: (minimized: boolean) => void
  state: InterpretationState
}

let infinityClient: InfinityClient

const audio: HTMLAudioElement = new Audio()
audio.autoplay = true

let pin: string | null = null
let mediaStream: MediaStream | undefined

export const InterpretationContextProvider = (props: {
  children?: JSX.Element
}): JSX.Element => {
  const volume: number =
    config.role === Role.Interpreter
      ? 100
      : config.listener?.mainFloorVolume ?? 0
  const initialState: InterpretationState = {
    role: config.role,
    connected: false,
    connecting: true,
    language: null,
    direction: Direction.MainRoomToInterpretation,
    muted: false,
    volume,
    minimized: false
  }

  const [state, dispatch] = useReducer(interpretationReducer, initialState)

  const setPin = (newPin: string): void => {
    pin = newPin
  }

  const connect = async (language: Language): Promise<void> => {
    const clientSignals = initializeInfinityClientSignals()
    const callSignals = initializeInfinityCallSignals()
    infinityClient = createInfinityClient(clientSignals, callSignals)

    const params = new URL(window.location.href).searchParams
    const username = params.get('username') as string
    // const username = getUser().displayName ?? getUser().uuid

    let roleTag: string
    let callType: ClientCallType

    if (!state.connected) {
      dispatch({
        type: InterpretationActionType.Connecting,
        body: {
          language
        }
      })
    }

    if (state.role === Role.Interpreter) {
      roleTag = 'Interpreter'
      const constraints = MainRoom.getMediaConstraints()
      mediaStream = await getMediaStream(constraints)
      const shouldSendReceive = config.interpreter?.allowChangeDirection
      if (shouldSendReceive) {
        callType = ClientCallType.Audio
      } else {
        callType = ClientCallType.AudioSendOnly
      }
    } else {
      roleTag = 'Listener'
      mediaStream = undefined
      const shouldSendReceive = config.listener?.speakToInterpretationRoom
      if (shouldSendReceive) {
        const constraints = MainRoom.getMediaConstraints()
        mediaStream = await getMediaStream(constraints)
        callType = ClientCallType.Audio
      } else {
        callType = ClientCallType.AudioRecvOnly
      }
    }

    const displayName = `${username} - ${roleTag}`

    try {
      const params = new URL(window.location.href).searchParams
      const mainConferenceAlias = params.get('conference') as string

      const conferenceAlias = mainConferenceAlias + language.code
      const bandwidth = 0
      if (pin != null) {
        await infinityClient.call({
          conferenceAlias,
          displayName,
          callType,
          bandwidth,
          mediaStream,
          pin
        })
      } else {
        await infinityClient.call({
          conferenceAlias,
          displayName,
          callType,
          bandwidth,
          mediaStream
        })
      }
    } catch (e) {
      stopStream(mediaStream)
      throw e
    }
  }

  const disconnect = async (): Promise<void> => {
    await infinityClient.disconnect({ reason: 'User initiated disconnect' })
    audio.pause()
    MainRoom.setVolume(1)
    MainRoom.disableMute(false)
    MainRoom.setMute(state.muted)
    // await setButtonActive(false)
    dispatch({
      type: InterpretationActionType.Disconnected
    })
  }

  const changeMediaDevice = async (
    constraints: MediaTrackConstraints
  ): Promise<void> => {
    if (
      state.connected &&
      (state.role === Role.Interpreter ||
        config.listener?.speakToInterpretationRoom)
    ) {
      stopStream(mediaStream)
      mediaStream = await getMediaStream(constraints)
      infinityClient.setStream(mediaStream)
    }
  }

  const changeLanguage = async (language: Language): Promise<void> => {
    await infinityClient.disconnect({ reason: 'User initiated disconnect' })
    MainRoom.setMute(state.muted)
    await connect(language)
    dispatch({
      type: InterpretationActionType.ChangedLanguage,
      body: {
        language
      }
    })
  }

  const changeDirection = async (direction: Direction): Promise<void> => {
    if (direction === Direction.MainRoomToInterpretation) {
      MainRoom.setMute(true)
      await infinityClient.mute({ mute: state.muted })
    } else {
      MainRoom.setMute(state.muted)
      await infinityClient.mute({ mute: true })
    }
    dispatch({
      type: InterpretationActionType.ChangedDirection,
      body: {
        direction
      }
    })
  }

  const changeMute = async (muted: boolean): Promise<void> => {
    if (state.direction === Direction.MainRoomToInterpretation) {
      await infinityClient.mute({ mute: muted })
    } else {
      MainRoom.setMute(muted)
    }

    dispatch({
      type: InterpretationActionType.ChangedMute,
      body: {
        muted
      }
    })
  }

  const changeVolume = (volume: number): void => {
    const mainRoomVolume = Math.min(2 * (1 - volume / 100), 1)
    const interpretationVolume = Math.min((volume * 2) / 100, 1)
    MainRoom.setVolume(mainRoomVolume)
    audio.volume = interpretationVolume
    dispatch({
      type: InterpretationActionType.ChangedVolume,
      body: {
        volume
      }
    })
  }

  const minimize = (minimized: boolean): void => {
    dispatch({
      type: InterpretationActionType.Minimize,
      body: {
        minimized
      }
    })
  }

  const getMediaStream = async (
    constraints?: MediaTrackConstraints
  ): Promise<MediaStream> => {
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: constraints ?? true,
        video: false
      })
      const audioTracks = stream.getAudioTracks()
      console.log('Using audio device: ' + audioTracks[0].label)
    } catch (e) {
      console.error(e)
      // const plugin = getPlugin()
      // await plugin.ui.showToast({ message: 'Interpretation cannot access the microphone' })
      throw e
    }
    return stream
  }

  const stopStream = (stream: MediaStream | undefined): void => {
    stream?.getTracks().forEach((track) => {
      track.stop()
    })
  }

  const initializeInfinityClientSignals = (): InfinitySignals => {
    const signals = createInfinityClientSignals([])
    signals.onPinRequired.add(handlePin)
    signals.onAuthenticatedWithConference.add(handleConnected)
    signals.onError.add(async (options) => {
      pin = null
      await disconnect()
      await showErrorPrompt(options)
    })
    return signals
  }

  const initializeInfinityCallSignals = (): CallSignals => {
    const signals = createCallSignals([])
    signals.onRemoteStream.add((stream) => {
      audio.srcObject = stream
    })
    return signals
  }

  const handlePin = async ({
    hasHostPin,
    hasGuestPin
  }: {
    hasHostPin: boolean
    hasGuestPin: boolean
  }): Promise<void> => {
    const role = config.role
    if (role === Role.Interpreter && hasHostPin) {
      await showPinForm()
    }
    if (role === Role.Listener) {
      if (hasGuestPin) {
        await showPinForm()
      } else {
        if (state.language != null && role != null) {
          setPin('')
          await connect(state.language)
        }
      }
    }
  }

  const handleConnected = async (): Promise<void> => {
    const showListenerMuteButton = config.listener?.speakToInterpretationRoom
    if (
      state.role === Role.Interpreter ||
      (state.role === Role.Listener && showListenerMuteButton)
    ) {
      if (MainRoom.isMuted()) {
        await changeMute(true)
      } else {
        MainRoom.setMute(true)
      }
      MainRoom.disableMute(true)
    }

    // await setButtonActive(true)
    dispatch({
      type: InterpretationActionType.Connected
    })
  }

  const interpretationContextValue = useMemo(
    () => ({
      setPin,
      connect,
      disconnect,
      changeMediaDevice,
      changeLanguage,
      changeDirection,
      changeMute,
      changeVolume,
      minimize,
      state
    }),
    [state]
  )

  return (
    <InterpretationContext.Provider value={interpretationContextValue}>
      {props.children}
    </InterpretationContext.Provider>
  )
}

export const useInterpretationContext = (): InterpretationContextType => {
  const interpretationContext = useContext(InterpretationContext)
  if (interpretationContext === null) {
    throw new Error(
      'useInterpretationContext has to be used within <InterpretationContext.Provider>'
    )
  }
  return interpretationContext
}

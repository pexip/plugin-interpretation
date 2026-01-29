import React, { createContext, useContext, useMemo, useReducer } from 'react'
import type { InterpretationState } from './InterpretationState'
import { Direction } from '../types/Direction'
import type { Language } from '../types/Language'
import { interpretationReducer } from './interpretationReducer'
import { config } from '../config'
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
import { showErrorPrompt } from '../prompts'
import { showPinForm } from '../forms'
import { Role } from '../types/Role'
import { getPlugin } from '../plugin'
import { getUser } from '../user'
import { getMainConferenceAlias } from '../conference'
import { MainRoom } from '../main-room'
import { setButtonActive } from '../button'
import { logger } from '../logger'

const batchScheduleTimeoutMS = 500
const batchBufferSize = 10

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

let infinityClient: InfinityClient | undefined = undefined

const audio: HTMLAudioElement = new Audio()
audio.autoplay = true

let pin: string | undefined = undefined
let mediaStream: MediaStream | undefined = undefined

export const InterpretationContextProvider = (props: {
  children?: React.JSX.Element
}): React.JSX.Element => {
  const maxVolume = 100
  const minVolume = 0
  const volume: number =
    config.role === Role.Interpreter
      ? maxVolume
      : (config.listener?.mainFloorVolume ?? minVolume)

  const initialState: InterpretationState = {
    role: config.role,
    connected: false,
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

    const username = getUser().displayName ?? getUser().uuid
    let roleTag = ''
    let callType: ClientCallType = ClientCallType.Audio

    if (!state.connected) {
      dispatch({
        type: InterpretationActionType.Connecting,
        body: {
          language
        }
      })
    }

    const { Audio, AudioSendOnly, AudioRecvOnly } = ClientCallType
    if (state.role === Role.Interpreter) {
      roleTag = 'Interpreter'
      const constraints = MainRoom.getMediaConstraints()
      mediaStream = await getMediaStream(constraints)
      const { interpreter } = config
      let shouldSendReceive = false
      if (interpreter != null) {
        const { allowChangeDirection } = interpreter
        shouldSendReceive = allowChangeDirection
      }
      if (shouldSendReceive) {
        callType = Audio
      } else {
        callType = AudioSendOnly
      }
    } else {
      roleTag = 'Listener'
      mediaStream = undefined
      const { listener } = config
      let shouldSendReceive = false
      if (listener != null) {
        const { speakToInterpretationRoom } = listener
        shouldSendReceive = speakToInterpretationRoom
      }
      if (shouldSendReceive) {
        const constraints = MainRoom.getMediaConstraints()
        mediaStream = await getMediaStream(constraints)
        callType = Audio
      } else {
        callType = AudioRecvOnly
      }
    }

    const displayName = `${username} - ${roleTag}`

    try {
      const conferenceAlias = getMainConferenceAlias() + language.code
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
    await infinityClient?.disconnect({ reason: 'User initiated disconnect' })
    await handleDisconnected()
  }

  const changeMediaDevice = async (
    constraints: MediaTrackConstraints
  ): Promise<void> => {
    if (
      state.connected &&
      (state.role === Role.Interpreter ||
        (config.listener?.speakToInterpretationRoom ?? false))
    ) {
      stopStream(mediaStream)
      mediaStream = await getMediaStream(constraints)
      infinityClient?.setStream(mediaStream)
    }
  }

  const changeLanguage = async (language: Language): Promise<void> => {
    await infinityClient?.disconnect({ reason: 'User initiated disconnect' })
    if (!isListenerUnidirectional()) {
      MainRoom.setMute(state.muted)
    }
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
      await infinityClient?.mute({ mute: state.muted })
    } else {
      MainRoom.setMute(state.muted)
      await infinityClient?.mute({ mute: true })
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
      await infinityClient?.mute({ mute: muted })
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
    const scale = 2
    const maxVolume = 1
    const maxVolumePercentage = 100
    const mainRoomVolume = Math.min(
      scale * (maxVolume - volume / maxVolumePercentage),
      maxVolume
    )
    const interpretationVolume = Math.min(
      (volume * scale) / maxVolumePercentage,
      maxVolume
    )
    MainRoom.setVolume(mainRoomVolume)
    audio.volume = interpretationVolume
    const minVolume = 0
    if (interpretationVolume === minVolume) {
      audio.muted = true
    } else {
      audio.muted = false
    }

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
    let stream: MediaStream | null = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: constraints ?? true,
        video: false
      })
      const [audioTrack] = stream.getAudioTracks()
      logger.info('Using audio device: ' + audioTrack.label)
    } catch (e) {
      logger.error(e)
      const plugin = getPlugin()
      await plugin.ui.showToast({
        message: 'Interpretation cannot access the microphone'
      })
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
    const signals = createInfinityClientSignals([], {
      batchScheduleTimeoutMS,
      batchBufferSize
    })
    signals.onPinRequired.add(handlePin)
    signals.onAuthenticatedWithConference.add(handleConnected)
    signals.onError.add(async (options) => {
      pin = undefined
      await showErrorPrompt(options)
    })
    signals.onDisconnected.add(handleDisconnected)
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
    const { role } = config
    if (role === Role.Interpreter && hasHostPin) {
      await showPinForm()
    }
    if (role === Role.Listener) {
      if (hasGuestPin) {
        await showPinForm()
      } else {
        if (state.language != null) {
          setPin('')
          await connect(state.language)
        }
      }
    }
  }

  const handleConnected = async (): Promise<void> => {
    const showListenerMuteButton =
      config.listener?.speakToInterpretationRoom ?? false
    const { Interpreter } = Role
    if (state.role === Interpreter || showListenerMuteButton) {
      if (MainRoom.isMuted()) {
        await changeMute(true)
      } else {
        MainRoom.setMute(true)
      }
      MainRoom.disableMute(true)
    }

    await setButtonActive(true)
    dispatch({
      type: InterpretationActionType.Connected
    })
  }

  const handleDisconnected = async (): Promise<void> => {
    audio.pause()
    const maxVolume = 1
    MainRoom.setVolume(maxVolume)
    if (!isListenerUnidirectional()) {
      MainRoom.disableMute(false)
      MainRoom.setMute(state.muted)
    }
    await setButtonActive(false)
    dispatch({
      type: InterpretationActionType.Disconnected
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

const isListenerUnidirectional = (): boolean => {
  const { role } = config
  return (
    role === Role.Listener &&
    config.listener?.speakToInterpretationRoom !== true
  )
}

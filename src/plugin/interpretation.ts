import {
  type CallSignals,
  ClientCallType,
  createCallSignals,
  createInfinityClientSignals,
  type InfinitySignals,
  type InfinityClient,
  createInfinityClient
} from '@pexip/infinity'
import { mainConferenceAlias } from './mainConferenceAlias'
import { config } from './config'
import { MainRoom } from './main-room'
import { showErrorPrompt } from './prompts'
import { Role } from '../types/Role'
import { user } from './user'
import { type Language } from '../types/Language'
import { plugin } from './plugin'
import { setButtonActive } from './button'
import { showPinForm } from './forms'
import { Direction } from '../types/Direction'
import { ConnectionState } from '../types/ConnectionState'
import { EventType, IframeEvents } from '../IframeEvents'

let infinityClient: InfinityClient

const audio: HTMLAudioElement = new Audio()
audio.autoplay = true

let pin: string | null = null
let mediaStream: MediaStream | undefined

let connectionState: ConnectionState = ConnectionState.Disconnected
let language: Language
const direction: Direction = Direction.MainRoomToInterpretation

const connect = async (lang: Language): Promise<void> => {
  const clientSignals = initializeInfinityClientSignals()
  const callSignals = initializeInfinityCallSignals()
  infinityClient = createInfinityClient(clientSignals, callSignals)

  const username = user.displayName ?? user.uuid
  let roleTag: string
  let callType: ClientCallType

  connectionState = ConnectionState.Connecting
  language = lang

  if (config.role === Role.Interpreter) {
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

const disconnect = async (): Promise<void> => {}

const changeMute = async (muted: boolean): Promise<void> => {
  if (direction === Direction.MainRoomToInterpretation) {
    await infinityClient.mute({ mute: muted })
  } else {
    MainRoom.setMute(muted)
  }

  IframeEvents.sendEvent(EventType.muteChanged, muted)
}

const initializeInfinityClientSignals = (): InfinitySignals => {
  const signals = createInfinityClientSignals([])
  signals.onPinRequired.add(handlePin)
  signals.onAuthenticatedWithConference.add(handleConnected)
  signals.onError.add(async (options) => {
    pin = null
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
      if (language != null && role != null) {
        await connect(language)
      }
    }
  }
}

const initIframeEvents = (): void => {
  IframeEvents.addEventListener(EventType.RequestConnectionState, () => {
    IframeEvents.sendEvent(
      EventType.ConnectionStateChanged,
      Interpretation.connectionState
    )
  })

  IframeEvents.addEventListener(EventType.changeMute, (muted: boolean) => {
    Interpretation.changeMute(muted).catch(console.error)
  })
}

const handleConnected = async (): Promise<void> => {
  const showListenerMuteButton = config.listener?.speakToInterpretationRoom
  if (
    config.role === Role.Interpreter ||
    (config.role === Role.Listener && showListenerMuteButton)
  ) {
    if (MainRoom.isMuted()) {
      await changeMute(true)
    } else {
      MainRoom.setMute(true)
    }
    MainRoom.disableMute(true)
  }

  await setButtonActive(true)
  connectionState = ConnectionState.Connected
  IframeEvents.sendEvent(EventType.ConnectionStateChanged, connectionState)
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

export const Interpretation = {
  initIframeEvents,
  connect,
  disconnect,
  changeMute,
  connectionState
}

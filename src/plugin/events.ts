import { type InfinityParticipant } from '@pexip/plugin-api'
import { setMainConferenceAlias } from './mainConferenceAlias'
import { MainRoom } from './main-room'
import { setUser } from './user'
import { plugin } from './plugin'

interface AuthenticatedWithConferenceEvent {
  conferenceAlias: string
}

export const initEvents = (): void => {
  plugin.events.authenticatedWithConference.add(
    handleAuthenticatedWithConference
  )
  plugin.events.me.add(handleMe)
  plugin.events.participants.add(handleParticipants)
  plugin.events.disconnected.add(handleDisconnected)
}

const handleAuthenticatedWithConference = (
  event: AuthenticatedWithConferenceEvent
): void => {
  setMainConferenceAlias(event.conferenceAlias)
}

const handleMe = (event: {
  id: string
  participant: InfinityParticipant
}): void => {
  setUser(event.participant)
}

const handleParticipants = (): void => {
  // Reset the volume in the video HTML element. This is needed because the web
  // app can re-create the element when a new participant joins.
  MainRoom.refreshVolume()
}

const handleDisconnected = async (): Promise<void> => {
  // await getInterpretationContext().disconnect()
}

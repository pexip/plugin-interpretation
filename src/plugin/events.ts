import { type InfinityParticipant } from '@pexip/plugin-api'
import { getPlugin } from '../plugin'
import { setUser } from './user'
import { setMainConferenceAlias } from '../plugin/conference'

interface AuthenticatedWithConferenceEvent {
  conferenceAlias: string
}

export const initEvents = (): void => {
  const plugin = getPlugin()
  plugin.events.authenticatedWithConference.add(
    handleAuthenticatedWithConference
  )
  plugin.events.me.add(handleMe)
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

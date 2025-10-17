import type { InfinityParticipant } from '@pexip/plugin-api'
import { setMainConferenceAlias } from './conference'
import { getInterpretationContext } from './interpretationContext'
import { MainRoom } from './main-room'
import { getPlugin } from './plugin'
import { setUser } from './user'
import i18n from 'i18next'

interface AuthenticatedWithConferenceEvent {
  conferenceAlias: string
}

export const initializeEvents = (): void => {
  const plugin = getPlugin()
  plugin.events.authenticatedWithConference.add(
    handleAuthenticatedWithConference
  )
  plugin.events.me.add(handleMe)
  plugin.events.participantsActivities.add(handleParticipantsActivities)
  plugin.events.disconnected.add(handleDisconnected)
  plugin.events.languageSelect.add(async (language: string): Promise<void> => {
    await i18n.changeLanguage(language)
  })
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

const handleParticipantsActivities = (): void => {
  // Reset the volume in the video HTML element. This is needed because the web
  // app can re-create the element when a new participant joins.
  MainRoom.refreshVolume()
}

const handleDisconnected = async (): Promise<void> => {
  await getInterpretationContext().disconnect()
}

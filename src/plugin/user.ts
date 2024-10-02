import type { InfinityParticipant } from '@pexip/plugin-api'

export let user: InfinityParticipant

export const setUser = (participant: InfinityParticipant): void => {
  user = participant
}

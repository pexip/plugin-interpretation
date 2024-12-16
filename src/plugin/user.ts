import type { InfinityParticipant } from '@pexip/plugin-api'

let user: InfinityParticipant

export const setUser = (participant: InfinityParticipant): void => {
  user = participant
}

export const getUser = (): InfinityParticipant => {
  return user
}

import type { InfinityParticipant } from '@pexip/plugin-api'

let user: InfinityParticipant | null = null

export const setUser = (participant: InfinityParticipant): void => {
  user = participant
}

export const getUser = (): InfinityParticipant => {
  if (user == null) {
    throw new Error('User not set')
  }
  return user
}

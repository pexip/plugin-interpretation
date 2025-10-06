let conferenceAlias: string | null = null

export const setMainConferenceAlias = (alias: string): void => {
  conferenceAlias = alias
}

export const getMainConferenceAlias = (): string => {
  if (conferenceAlias == null) {
    throw new Error('Conference alias not set')
  }
  return conferenceAlias
}

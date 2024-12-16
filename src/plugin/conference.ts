let conferenceAlias: string

export const setMainConferenceAlias = (alias: string): void => {
  conferenceAlias = alias
}

export const getMainConferenceAlias = (): string => {
  return conferenceAlias
}

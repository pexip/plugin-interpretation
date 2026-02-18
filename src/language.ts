import { config } from './config'
import { capitalizeFirstLetter } from './utils'

import type { Option } from './types/Option'
import type { Language } from './types/Language'
import { getUser } from './user'

export const getLanguageByCode = (code: string): Language | undefined =>
  config.languages.find((language) => language.code === code)

export const getLanguageOptions = (): Option[] => {
  const languages = getAvailableLanguages()
  const options = languages.map((language) => ({
    id: language.code,
    label: capitalizeFirstLetter(language.name)
  }))
  return options
}

const getAvailableLanguages = (): Language[] => {
  const { languages } = config
  const { rawData } = getUser()
  const { call_tag: callTag } = rawData

  if (callTag != null) {
    const parts = callTag.split('?')
    const minLength = 1
    if (parts.length > minLength) {
      const secondPartIndex = 1
      const callTagLanguages = parts[secondPartIndex]
        .split(',')
        .map((language) => language.trim().toLowerCase())
      const availableLanguages = languages.filter((language) =>
        callTagLanguages.includes(language.name)
      )
      const empty = 0
      if (availableLanguages.length > empty) {
        return availableLanguages
      }
    }
  }

  return languages
}

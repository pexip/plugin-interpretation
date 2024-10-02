import { config } from './plugin/config'
import { capitalizeFirstLetter } from './plugin/utils'

import type { Option } from './types/Option'
import type { Language } from './types/Language'

export const getLanguageByCode = (code: string): Language | undefined => {
  return config.languages.find((language) => language.code === code)
}

export const getLanguageOptions = (): Option[] => {
  const options = config.languages.map((language) => ({
    id: language.code,
    label: capitalizeFirstLetter(language.name)
  }))
  return options
}

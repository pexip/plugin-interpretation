import React from 'react'

import { Select } from '@pexip/components'
// import { useInterpretationContext } from '../../InterpretationContext/InterpretationContext'
import { getLanguageByCode, getLanguageOptions } from '../../language'
import { type Language } from '../../types/Language'

import './BaseLanguageSelector.scss'

export const BaseLanguageSelector = (): JSX.Element => {
  // const { changeLanguage, state } = useInterpretationContext()
  // const { language } = state
  const language: Language = {
    code: '0034',
    name: 'French'
  }

  const handleChangeLanguage = async (code: string): Promise<void> => {
    const language = getLanguageByCode(code)
    if (language != null) {
      // await changeLanguage(language)
    }
  }

  return (
    <Select
      className="BaseLanguageSelector"
      isFullWidth
      data-testid="BaseLanguageSelector"
      label={''}
      value={language?.code ?? ''}
      options={getLanguageOptions()}
      onValueChange={(code: string) => {
        handleChangeLanguage(code).catch((e) => {
          console.error(e)
        })
      }}
    />
  )
}

import React from 'react'

import { getLanguageByCode, getLanguageOptions } from '../../../language'
import { Select } from '@pexip/components'
import { useInterpretationContext } from '../../contexts/InterpretationContext/InterpretationContext'

import './BaseLanguageSelector.scss'

export const BaseLanguageSelector = (): JSX.Element => {
  const { changeLanguage, state } = useInterpretationContext()
  const { language } = state

  const handleChangeLanguage = async (code: string): Promise<void> => {
    const language = getLanguageByCode(code)
    if (language != null) {
      await changeLanguage(language)
    }
  }

  return (
    <Select className='BaseLanguageSelector' isFullWidth
      data-testid='BaseLanguageSelector'
      label={''}
      value={language?.code ?? ''}
      options={getLanguageOptions()}
      onValueChange={(code: string) => { handleChangeLanguage(code).catch((e) => { console.error(e) }) }}
    />
  )
}

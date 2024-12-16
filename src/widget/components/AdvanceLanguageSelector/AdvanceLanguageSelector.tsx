import React from 'react'

import { Select } from '@pexip/components'
import { getLanguageOptions, getLanguageByCode } from '../../../language'
import { Direction } from '../../../types/Direction'
import { useInterpretationContext } from '../../contexts/InterpretationContext/InterpretationContext'
import clsx from 'clsx'

import './AdvanceLanguageSelector.scss'

export const AdvanceLanguageSelector = (): JSX.Element => {
  const { changeLanguage, changeDirection, state } = useInterpretationContext()
  const { language, direction } = state

  const reversed = direction === Direction.InterpretationToMainRoom

  const handleChangeLanguage = async (code: string): Promise<void> => {
    const language = getLanguageByCode(code)
    if (language != null) {
      await changeLanguage(language)
    }
  }

  const handleChangeDirection = async (): Promise<void> => {
    let newDirection = Direction.MainRoomToInterpretation
    if (direction === Direction.MainRoomToInterpretation) {
      newDirection = Direction.InterpretationToMainRoom
    }
    await changeDirection(newDirection)
  }

  return (
    <div
      className={clsx('AdvanceLanguageSelector', { reversed })}
      data-testid='AdvanceLanguageSelector'
    >

      <Select className='MainFloorSelect Select' isFullWidth
        label={reversed ? 'To' : 'From'}
        value={'main'}
        isDisabled={true}
        onValueChange={() => {}}
        options={[{
          id: 'main',
          label: 'Main floor'
        }]}
      />

      <button
        className='exchange'
        aria-label='exchange button'
        onClick={() => { handleChangeDirection().catch((e) => { console.error(e) }) }}>
        <img src='exchange.svg' />
      </button>

      <Select className='LanguageSelect Select' isFullWidth
        data-testid='LanguageSelect'
        aria-label='language select'
        label={reversed ? 'From' : 'To'}
        value={language != null ? language.code : ''}
        options={getLanguageOptions()}
        onValueChange={(code: string) => { handleChangeLanguage(code).catch((e) => { console.error(e) }) }}
      />

    </div>
  )
}

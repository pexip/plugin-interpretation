import React from 'react'
import { Select } from '@pexip/components'
import { getLanguageOptions, getLanguageByCode } from '../../language'
import { Direction } from '../../types/Direction'
import { useInterpretationContext } from '../../InterpretationContext/InterpretationContext'
import clsx from 'clsx'
import { logger } from '../../logger'

import './AdvanceLanguageSelector.scss'

export const AdvanceLanguageSelector = (): React.JSX.Element => {
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
    const { MainRoomToInterpretation, InterpretationToMainRoom } = Direction
    let newDirection = MainRoomToInterpretation
    if (direction === Direction.MainRoomToInterpretation) {
      newDirection = InterpretationToMainRoom
    }
    await changeDirection(newDirection)
  }

  return (
    <div
      className={clsx('AdvanceLanguageSelector', { reversed })}
      data-testid="AdvanceLanguageSelector"
    >
      <Select
        className="MainFloorSelect Select"
        isFullWidth
        label={reversed ? 'To' : 'From'}
        value={'main'}
        isDisabled={true}
        onValueChange={() => undefined}
        options={[
          {
            id: 'main',
            label: 'Main floor'
          }
        ]}
      />

      <button
        className="exchange"
        aria-label="exchange button"
        onClick={() => {
          handleChangeDirection().catch(logger.error)
        }}
      >
        <img src="exchange.svg" />
      </button>

      <Select
        className="LanguageSelect Select"
        isFullWidth
        data-testid="LanguageSelect"
        aria-label="language select"
        label={reversed ? 'From' : 'To'}
        value={language != null ? language.code : ''}
        options={getLanguageOptions()}
        onValueChange={(code: string) => {
          handleChangeLanguage(code).catch(logger.error)
        }}
      />
    </div>
  )
}

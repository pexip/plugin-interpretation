import React from 'react'

import { Role } from '../types/Role'
import { Volume } from './Volume/Volume'
import { AdvanceLanguageSelector } from './AdvanceLanguageSelector/AdvanceLanguageSelector'
import { BaseLanguageSelector } from './BaseLanguageSelector/BaseLanguageSelector'
import { DraggableDialog } from './DraggableDialog/DraggableDialog'
import { MuteButton } from './MuteButton/MuteButton'
import { useInterpretationContext } from '../InterpretationContext/InterpretationContext'
import { config } from '../config'

export const Widget = (): React.JSX.Element => {
  const { state } = useInterpretationContext()
  const { role } = state

  const { interpreter, listener } = config

  let showAdvanceLanguageSelector = false
  let showBaseLanguageSelector = false
  let showListenerMuteButton = false

  if (interpreter != null) {
    const { allowChangeDirection } = interpreter
    showAdvanceLanguageSelector = allowChangeDirection
  }

  if (listener != null) {
    const { speakToInterpretationRoom } = listener
    showListenerMuteButton = speakToInterpretationRoom
  }

  showBaseLanguageSelector = !showAdvanceLanguageSelector

  return (
    <DraggableDialog title="Interpretation">
      <div className="Container">
        {role === Role.Interpreter && (
          <>
            {showAdvanceLanguageSelector && <AdvanceLanguageSelector />}
            {showBaseLanguageSelector && <BaseLanguageSelector />}
            <MuteButton />
          </>
        )}
        {role === Role.Listener && (
          <>
            <BaseLanguageSelector />
            <Volume />
            {showListenerMuteButton && <MuteButton />}
          </>
        )}
      </div>
    </DraggableDialog>
  )
}

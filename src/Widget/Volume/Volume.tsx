import React from 'react'

import { RangeSlider } from '@pexip/components'
import { useInterpretationContext } from '../../InterpretationContext/InterpretationContext'

import './Volume.scss'

export const Volume = (): React.JSX.Element => {
  const { changeVolume, state } = useInterpretationContext()
  const { volume } = state

  const handleVolumeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    changeVolume(parseInt(event.target.value))
  }

  const middleVolume = 50

  return (
    <div className="Volume" data-testid="Volume">
      <span>Volume</span>
      <RangeSlider
        className="VolumeSlider"
        min={0}
        max={100}
        step={1}
        selectedValue={volume}
        onChange={(event) => {
          handleVolumeChange(event)
        }}
      />
      <div
        className={`VolumeFooter ${volume < middleVolume ? 'MainFloorSelected' : 'InterpreterSelected'}`}
        data-testid="VolumeFooter"
      >
        <span className="MainFloorLabel">Main floor</span>
        <span className="InterpreterLabel">Interpreter</span>
      </div>
    </div>
  )
}

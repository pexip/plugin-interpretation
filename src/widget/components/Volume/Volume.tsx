import React from 'react'

import { RangeSlider } from '@pexip/components'
import { useInterpretationContext } from '../../contexts/InterpretationContext/InterpretationContext'

import './Volume.scss'

export const Volume = (): JSX.Element => {
  const { changeVolume, state } = useInterpretationContext()
  const { volume } = state

  const handleVolumeChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    changeVolume(parseInt(event.target.value))
  }

  return (
    <div className='Volume' data-testid='Volume'>
      <span>Volume</span>
      <RangeSlider className='VolumeSlider' min={0} max={100} step={1} selectedValue={volume}
        onChange={(event) => { handleVolumeChange(event).catch((e) => { console.error(e) }) }}
      />
      <div
        className={`VolumeFooter ${volume < 50 ? 'MainFloorSelected' : 'InterpreterSelected'}`}
        data-testid='VolumeFooter'
      >
        <span className='MainFloorLabel'>Main floor</span>
        <span className='InterpreterLabel'>Interpreter</span>
      </div>
    </div>
  )
}

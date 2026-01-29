import React, { useEffect } from 'react'
import { RangeSlider } from '@pexip/components'
import { useInterpretationContext } from '../../InterpretationContext/InterpretationContext'
import { useTranslation } from 'react-i18next'
import { isIOS } from '../../utils'

import './Volume.scss'

export const Volume = (): React.JSX.Element => {
  const { changeVolume, state } = useInterpretationContext()
  const { volume } = state

  const { t } = useTranslation()

  const defaultStep = 1
  const iosStep = 100

  const middleVolume = 50

  const step = isIOS() ? iosStep : defaultStep

  const handleVolumeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    changeVolume(parseInt(event.target.value))
  }

  const hasMainFloorPriority = volume < middleVolume

  useEffect(() => {
    if (isIOS()) {
      // Set initial volume on mount for iOS devices
      const minVolumeIOS = 0
      const maxVolume = 100
      if (hasMainFloorPriority) {
        changeVolume(minVolumeIOS)
      } else {
        changeVolume(maxVolume)
      }
    }
  }, [])

  return (
    <div className="Volume" data-testid="Volume">
      <span>{t('volume', 'Volume')}</span>
      <RangeSlider
        className="VolumeSlider"
        min={0}
        max={100}
        step={step}
        selectedValue={volume}
        onChange={(event) => {
          handleVolumeChange(event)
        }}
      />
      <div
        className={`VolumeFooter ${hasMainFloorPriority ? 'MainFloorSelected' : 'InterpreterSelected'}`}
        data-testid="VolumeFooter"
      >
        <span className="MainFloorLabel">{t('mainFloor', 'Main floor')}</span>
        <span className="InterpreterLabel">
          {t('interpreter', 'Interpreter')}
        </span>
      </div>
    </div>
  )
}

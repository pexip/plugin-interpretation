import React, { useEffect } from 'react'
import { registerWidget } from '@pexip/plugin-api'
import { setPlugin } from '../plugin'
import { initializeEvents } from './events'
import { useInterpretationContext } from './contexts/InterpretationContext/InterpretationContext'
import { setInterpretationContext } from './interpretationContext'
import { AdvanceLanguageSelector } from './components/AdvanceLanguageSelector/AdvanceLanguageSelector'
import { BaseLanguageSelector } from './components/BaseLanguageSelector/BaseLanguageSelector'
import { Volume } from './components/Volume/Volume'
import { MuteButton } from './components/MuteButton/MuteButton'
import { config } from '../config'
import { Role } from '../types/Role'
import { Connecting } from './components/Connecting/Connecting'
import { CannotConnect } from './components/CannotConnect/CannotConnect'
import { getLanguageByCode } from '../language'

import './App.scss'

export const App = (): JSX.Element => {
  const { state } = useInterpretationContext()
  const { role } = state

  const allowChangeDirection = config.interpreter?.allowChangeDirection
  const showListenerMuteButton = config.listener?.speakToInterpretationRoom

  const interpretationContext = useInterpretationContext()
  const { connected, connecting } = interpretationContext.state

  useEffect(() => {
    const bootStrap = async (): Promise<void> => {
      const widget = await registerWidget({
        id: 'widget-interpretation',
        version: 0
      })

      setPlugin(widget)
      initializeEvents()

      const params = new URL(window.location.href).searchParams
      const languageCode = params.get('languageCode') as string
      if (languageCode == null) {
        throw new Error('Language code is required')
      }

      const language = getLanguageByCode(languageCode)

      if (language == null) {
        throw new Error('Language not found')
      }

      interpretationContext.connect(language)
    }
    bootStrap().catch((e) => {
      console.error(e)
    })
  }, [])

  useEffect(() => {
    setInterpretationContext(interpretationContext)
  }, [interpretationContext])

  if (!connected) {
    if (connecting) {
      return <Connecting />
    } else {
      return <CannotConnect />
    }
  }

  const languageSelector =
    role === Role.Interpreter && allowChangeDirection ? (
      <AdvanceLanguageSelector />
    ) : (
      <BaseLanguageSelector />
    )
  const volume = role === Role.Listener ? <Volume /> : null
  const muteButton =
    role === Role.Interpreter || showListenerMuteButton ? <MuteButton /> : null

  return (
    <div data-testid="App" className="App">
      {languageSelector}
      {volume}
      {muteButton}
    </div>
  )
}

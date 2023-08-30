import React, { useEffect, useState } from 'react'

import { registerPlugin } from '@pexip/plugin-api'
import { setPlugin } from './plugin'
import { initializeEvents } from './events'
import { initializeButton } from './button'
import { initializeIFrame } from './iframe'
import { LanguageIndicator } from './components/LanguagePanel/LanguagePanel'
import { ThemeProvider } from '@pexip/components'
import { Interpretation } from './interpretation'
import type { Language } from './language'
import { setMainRoomVolume, muteMainRoomAudio } from './main-room'
import { config } from './config'
import { Role } from './role'

export const App = (): JSX.Element => {
  const [language, setLanguage] = useState<Language | null>(null)

  useEffect(() => {
    const bootStrap = async (): Promise<void> => {
      const plugin = await registerPlugin({
        id: 'interpretation',
        version: 0
      })

      setPlugin(plugin)
      initializeEvents()
      await initializeButton()
      initializeIFrame()

      Interpretation.registerOnChangeLanguageCallback((language) => {
        setLanguage(language)
        if (language != null) {
          if (config.role === Role.Interpreter) {
            muteMainRoomAudio()
          } else {
            setMainRoomVolume(0.1)
          }
        } else {
          if (config.role === Role.Listener) {
            setMainRoomVolume(1)
          }
        }
      })
    }

    bootStrap().catch((e) => { console.error(e) })
  }, [])

  return (
    <ThemeProvider colorScheme='light'>
      {language != null &&
        <LanguageIndicator
          languageName={language?.name ?? ''}
          role={config.role}
        />}
    </ThemeProvider>
  )
}

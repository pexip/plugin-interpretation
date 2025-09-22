import React, { useEffect } from 'react'
import { registerPlugin } from '@pexip/plugin-api'
import { setPlugin } from './plugin'
import { initializeEvents } from './events'
import { initializeButton } from './button'
import { initializeIFrame } from './iframe'
import { Widget } from './Widget/Widget'
import { useInterpretationContext } from './InterpretationContext/InterpretationContext'
import { setInterpretationContext } from './interpretationContext'
import { logger } from './logger'

const pluginId = 'interpretation'
const version = 0

export const App = (): React.JSX.Element => {
  const interpretationContext = useInterpretationContext()
  const { state } = interpretationContext
  const { connected, minimized } = state

  useEffect(() => {
    const bootStrap = async (): Promise<void> => {
      const plugin = await registerPlugin({
        id: pluginId,
        version
      })

      setPlugin(plugin)
      initializeEvents()
      await initializeButton()
      initializeIFrame()
    }
    bootStrap().catch(logger.error)
  }, [])

  useEffect(() => {
    setInterpretationContext(interpretationContext)
  }, [interpretationContext])

  return (
    <div data-testid="App">{connected && !minimized ? <Widget /> : null}</div>
  )
}

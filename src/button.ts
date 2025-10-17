import { getPlugin } from './plugin'
import { showSelectLanguageForm } from './forms'
import type { Button, ToolbarButtonPayload } from '@pexip/plugin-api'
import { getInterpretationContext } from './interpretationContext'
import { t } from 'i18next'

let button: Button<'toolbar'> | null = null

const buttonPayload: ToolbarButtonPayload = {
  position: 'toolbar',
  icon: 'IconSupport',
  tooltip: t('interpretation', 'Interpretation'),
  roles: ['chair', 'guest']
}

export const initializeButton = async (): Promise<void> => {
  const plugin = getPlugin()
  button = await plugin.ui.addButton(buttonPayload)
  button.onClick.add(handleClick)
  plugin.events.languageSelect.add(async () => {
    await button?.update({
      ...buttonPayload,
      tooltip: t('interpretation', 'Interpretation')
    })
  })
}

export const setButtonActive = async (active: boolean): Promise<void> => {
  if (button == null) {
    throw new Error('Button not initialized')
  }
  await button.update(
    Object.assign(buttonPayload, {
      isActive: active
    })
  )
}

const handleClick = async (): Promise<void> => {
  const { minimize, state } = getInterpretationContext()
  const { connected } = state

  if (connected) {
    minimize(false)
  } else {
    await showSelectLanguageForm()
  }
}

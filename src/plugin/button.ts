import { showInterpreterForm } from './forms'
import type { Button, ToolbarButtonPayload } from '@pexip/plugin-api'
import { plugin } from './plugin'

let button: Button<'toolbar'>

const buttonPayload: ToolbarButtonPayload = {
  position: 'toolbar',
  icon: 'IconSupport',
  tooltip: 'Interpretation',
  roles: ['chair', 'guest']
}

export const initButton = async (): Promise<void> => {
  button = await plugin.ui.addButton(buttonPayload)
  button.onClick.add(handleClick)
}

export const setButtonActive = async (active: boolean): Promise<void> => {
  await button.update({
    isActive: active,
    ...buttonPayload
  })
}

const handleClick = async (): Promise<void> => {
  // const { minimize, state } = getInterpretationContext()
  // const { connected } = state

  // if (connected) {
  //   minimize(false)
  // } else {
  // await showInterpreterForm()
  // }

  await showInterpreterForm()
}

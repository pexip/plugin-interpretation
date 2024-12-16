import { showConnectForm } from './forms'
import { getPlugin } from '../plugin'
import type { Button, ToolbarButtonPayload } from '@pexip/plugin-api'

let button: Button<'toolbar'>

const buttonPayload: ToolbarButtonPayload = {
  position: 'toolbar',
  icon: 'IconSupport',
  tooltip: 'Interpretation',
  roles: ['chair', 'guest']
}

export const initButton = async (): Promise<void> => {
  const plugin = getPlugin()
  button = await plugin.ui.addButton(buttonPayload)
  button.onClick.add(handleClick)
}

export const setButtonActive = async (active: boolean): Promise<void> => {
  await button.update(
    Object.assign(buttonPayload, {
      isActive: active
    })
  )
}

const handleClick = async (): Promise<void> => {
  await showConnectForm()
}

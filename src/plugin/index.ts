import { registerPlugin } from '@pexip/plugin-api'
import { setPlugin } from '../plugin'
import { initButton } from './button'
import { initEvents } from './events'

const plugin = await registerPlugin({
  id: 'plugin-interpretation',
  version: 1
})

setPlugin(plugin)

await initButton()

await initEvents()

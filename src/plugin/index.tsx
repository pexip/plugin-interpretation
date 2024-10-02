import { registerPlugin } from '@pexip/plugin-api'
import { setPlugin } from './plugin'
import { initButton } from './button'
import { config } from './config'
import { initEvents } from './events'
import { dialogId } from './dialogId'
import { Interpretation } from './interpretation'

const plugin = await registerPlugin({
  id: 'interpretation',
  version: 0
})

setPlugin(plugin)

const params = new URLSearchParams()

params.append('role', config.role)

if (config.listener?.speakToInterpretationRoom) {
  params.append('allowChangeDirection', 'true')
}

if (config.interpreter?.allowChangeDirection) {
  params.append('showListenerMuteButton', 'true')
}

window.plugin.iframeManager.add({
  id: dialogId,
  url: window.location.href + 'dialog.html?' + params.toString(),
  type: 'draggable',
  headerTitle: 'Interpretation',
  initPosition: { x: 'calc(50% - 150px)', y: '0' }
})

await initButton()
initEvents()
Interpretation.initIframeEvents()

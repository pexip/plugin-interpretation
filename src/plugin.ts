import type { Plugin } from '@pexip/plugin-api'

let pluginInstance: Plugin | null = null

export const setPlugin = (plugin: Plugin): void => {
  pluginInstance = plugin
}

export const getPlugin = (): Plugin => {
  if (pluginInstance == null) {
    throw new Error('Plugin not set')
  }
  return pluginInstance
}

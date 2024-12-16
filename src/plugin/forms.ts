import { getLanguageOptions } from '../language'
import { getMainConferenceAlias } from './conference'
import { getPlugin } from '../plugin'
import { getUser } from './user'
import { Role } from '../types/Role'
import { config } from '../config'

export const showConnectForm = async (): Promise<void> => {
  const plugin = getPlugin()

  const input = await plugin.ui.showForm({
    title: 'Select language',
    form: {
      elements: {
        language: {
          name: 'Language',
          type: 'select',
          options: getLanguageOptions()
        }
      },
      submitBtnTitle: 'Join'
    }
  })

  const conference = getMainConferenceAlias()
  const displayName = getUser().displayName ?? getUser().uuid

  const widgetSrc = new URL(
    `${window.location.href.replace(/index.html$/, '')}widget.html`
  )

  widgetSrc.searchParams.append('conference', conference)
  widgetSrc.searchParams.append('languageCode', input.language)
  widgetSrc.searchParams.append('username', displayName)

  const widget = await plugin.ui.addWidget({
    type: 'floating',
    src: widgetSrc.href,
    title: 'Interpretation',
    draggable: true,
    dimensions: {
      width: '300px',
      height: getWidgetHeight()
    }
  })

  const widgetElement = parent.document.getElementById(widget.id)

  if (widgetElement != null) {
    widgetElement.style.minHeight = '0'
  }

  widget.toggle()
}

const getWidgetHeight = (): string => {
  let height = 0

  const header = 50
  const padding = 20
  const separator = 10
  const advancedLanguageSelector = 70
  const baseLanguageSelector = 40
  const muteButtonHeight = 40
  const volumeHeight = 90

  const role = config.role
  const showListenerMuteButton = config.listener?.speakToInterpretationRoom

  const hasAdvancedLanguageSelector =
    role === Role.Interpreter && config.interpreter?.allowChangeDirection
  const hasVolume = role === Role.Listener
  const hasMuteButton = role === Role.Interpreter || showListenerMuteButton

  height += header
  height += padding

  if (hasAdvancedLanguageSelector) {
    height += advancedLanguageSelector
  } else {
    height += baseLanguageSelector
  }

  if (hasVolume) {
    height += separator
    height += volumeHeight
  }

  if (hasMuteButton) {
    height += separator
    height += muteButtonHeight
  }

  return `${height}px`
}

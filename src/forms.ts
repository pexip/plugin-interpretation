import { getInterpretationContext } from './interpretationContext'
import { getLanguageByCode, getLanguageOptions } from './language'
import { getPlugin } from './plugin'

export const showInterpreterForm = async (): Promise<void> => {
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
  const language = getLanguageByCode(input.language)
  if (language != null) {
    await getInterpretationContext().connect(language)
  }
}

export const showPinForm = async (): Promise<void> => {
  const plugin = getPlugin()

  const input = await plugin.ui.showForm({
    title: 'PIN Required',
    form: {
      elements: {
        pin: {
          name: 'PIN',
          type: 'password',
          placeholder: 'Enter PIN',
          isOptional: false
        }
      },
      submitBtnTitle: 'Join'
    }
  })

  const { setPin, connect, disconnect, state } = getInterpretationContext()
  const { language } = state

  if (input.pin !== '') {
    if (language != null) {
      setPin(input.pin)
      await connect(language)
    }
  } else {
    await disconnect()
  }
}

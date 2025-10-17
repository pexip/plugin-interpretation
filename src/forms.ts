import { getInterpretationContext } from './interpretationContext'
import { getLanguageByCode, getLanguageOptions } from './language'
import { getPlugin } from './plugin'
import { t } from 'i18next'

export const showSelectLanguageForm = async (): Promise<void> => {
  const plugin = getPlugin()

  const input = await plugin.ui.showForm({
    title: t('selectLanguageForm.title', 'Select Language'),
    form: {
      elements: {
        language: {
          name: t('selectLanguageForm.language', 'Language'),
          type: 'select',
          options: getLanguageOptions()
        }
      },
      submitBtnTitle: t('join', 'Join')
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
    title: t('pinForm.title', 'Enter PIN'),
    form: {
      elements: {
        pin: {
          name: 'PIN',
          type: 'password',
          placeholder: t('pinForm.placeholder', 'Enter PIN'),
          isOptional: false
        }
      },
      submitBtnTitle: t('pinForm.join', 'Join')
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

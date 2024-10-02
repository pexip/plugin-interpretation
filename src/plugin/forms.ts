import { dialogId } from './dialogId'
import { Interpretation } from './interpretation'
import { getLanguageByCode, getLanguageOptions } from '../language'
import { plugin } from './plugin'

export const showInterpreterForm = async (): Promise<void> => {
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
  if (language !== undefined) {
    await plugin.ui.togglePlugin({ id: dialogId })
    await Interpretation.connect(language)
  }
}

export const showPinForm = async (): Promise<void> => {
  // const input = await plugin.ui.showForm({
  //   title: 'PIN Required',
  //   form: {
  //     elements: {
  //       pin: {
  //         name: 'PIN',
  //         type: 'password',
  //         placeholder: 'Enter PIN',
  //         isOptional: false
  //       }
  //     },
  //     submitBtnTitle: 'Join'
  //   }
  // })
  // const { setPin, connect, disconnect, state } = getInterpretationContext()
  // const { language } = state
  // if (input.pin != null) {
  //   if (language != null) {
  //     setPin(input.pin)
  //     await connect(language)
  //   }
  // } else {
  //   await disconnect()
  // }
}

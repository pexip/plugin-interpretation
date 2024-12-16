import { getInterpretationContext } from './interpretationContext'
import { getPlugin } from '../plugin'
import type { ExtendedInfinityErrorCode } from '@pexip/infinity'
import { getWidget } from '../plugin/widget'

export const showDisconnectPrompt = async (): Promise<void> => {
  const plugin = getPlugin()
  const primaryAction = 'Leave'

  const prompt = await plugin.ui.addPrompt({
    title: 'Leave Interpretation',
    description: 'Do you want to leave the interpretation?',
    prompt: {
      primaryAction,
      secondaryAction: 'Cancel'
    }
  })

  prompt.onInput.add(async (result) => {
    await prompt.remove()
    if (result === primaryAction) {
      await getInterpretationContext().disconnect()
    }
  })
}

export const showErrorPrompt = async ({
  error,
  errorCode
}: {
  error: string
  errorCode: ExtendedInfinityErrorCode
}): Promise<void> => {
  const plugin = getPlugin()

  const prompt = await plugin.ui.addPrompt({
    title: 'Error',
    description: error,
    prompt: {
      primaryAction: 'Close'
    }
  })

  prompt.onInput.add(async () => {
    prompt.remove()
    const widgetElement = window.frameElement?.parentNode
      ?.parentNode as HTMLElement
    widgetElement.remove()
  })
}

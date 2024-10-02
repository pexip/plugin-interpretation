import type { ExtendedInfinityErrorCode } from '@pexip/infinity'
import { plugin } from './plugin'
import { Interpretation } from './interpretation'

export const showDisconnectPrompt = async (): Promise<void> => {
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
      await Interpretation.disconnect()
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
  await plugin.ui.showPrompt({
    title: 'Error',
    description: error,
    prompt: {
      primaryAction: 'Close'
    }
  })
}

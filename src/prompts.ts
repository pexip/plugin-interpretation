import { getInterpretationContext } from './interpretationContext'
import { getPlugin } from './plugin'
import type { ExtendedInfinityErrorCode } from '@pexip/infinity'
import { t } from 'i18next'

export const showDisconnectPrompt = async (): Promise<void> => {
  const plugin = getPlugin()
  const primaryAction = t('disconnectPrompt.leave', 'Leave')

  const prompt = await plugin.ui.addPrompt({
    title: t('disconnectPrompt.title', 'Leave interpretation'),
    description: t(
      'disconnectPrompt.content',
      'Are you sure you want to leave the interpretation session?'
    ),
    prompt: {
      primaryAction,
      secondaryAction: t('disconnectPrompt.stay', 'Stay')
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

  await plugin.ui.showPrompt({
    title: t('errorPrompt.title', 'Error'),
    description: error,
    prompt: {
      primaryAction: t('errorPrompt.close', 'Close')
    }
  })
}

const toolbarUnmutedTestId = 'button-meeting-audioinput'
const toolbarMutedTestId = 'button-meeting-audioinput-muted'
const foldedSelViewTestId = 'button-toggle-audio-in-folded-selfview'
const selfViewWrapperTestId = 'button-selfview-quality'
const meetingWrapperTestId = 'meeting-wrapper'

const toolbarUnmutedSelector = `button[data-testid=${toolbarUnmutedTestId}]`
const toolbarMutedSelector = `button[data-testid=${toolbarMutedTestId}]`
const foldedSelViewSelector = `button[data-testid=${foldedSelViewTestId}]`
const qualitySelector = `button[data-testid=${selfViewWrapperTestId}]`
const selfViewContainerSelector = `div[data-testid=${meetingWrapperTestId}]>div:nth-child(3)`

const observerCallback = (mutationList: any): void => {
  disable(true)
}

const selfViewObserver = new MutationObserver(observerCallback)

const selfViewObserverConfig = { attributes: false, childList: true, subtree: false }

const disable = (disabled: boolean): void => {
  const toolbarButton = getToolbarButton()
  const foldedSelfViewButton = getFoldedSelfViewButton()
  const selfViewButton = getSelfViewButton()

  const buttons = [toolbarButton, foldedSelfViewButton, selfViewButton]

  buttons.forEach((button) => {
    if (button != null) {
      if (disabled) {
        disableButton(button)
      } else {
        enableButton(button)
      }
    }
  })

  // Observe when the selfView is re-created and take the disable value from the
  // toolbar mute button and reflects it in the button in the selfView.
  if (disabled) {
    const selfViewContainer = parent.document.querySelector(selfViewContainerSelector)
    if (selfViewContainer != null) {
      selfViewObserver.observe(selfViewContainer, selfViewObserverConfig)
    }
  } else {
    selfViewObserver.disconnect()
  }
}

const mute = (mute: boolean): void => {
  const toolbarButton = getToolbarButton()
  if (toolbarButton != null) {
    const disabled = toolbarButton.disabled
    if (isMuted() !== mute) {
      if (disabled) {
        disable(false)
      }
      toolbarButton.click()
      if (disabled) {
        disable(true)
      }
    }
  }
}

const isMuted = (): boolean => {
  const toolbarButton: HTMLButtonElement | null = parent.document.querySelector(toolbarMutedSelector)
  if (toolbarButton != null) {
    return true
  } else {
    return false
  }
}

const enableButton = (button: HTMLButtonElement): void => {
  button.removeAttribute('disabled')
  button.removeAttribute('style')
}

const disableButton = (button: HTMLButtonElement): void => {
  const isFoldedSelfView = button.getAttribute('data-testid') === foldedSelViewTestId

  button.setAttribute('disabled', '')
  button.style.color = 'rgba(100, 100, 100, .35)'
  button.style.backgroundColor = isFoldedSelfView ? 'transparent' : 'rgba(17, 17, 17, .65)'
  button.style.boxShadow = 'none'
  button.style.cursor = 'default'
  button.style.transition = 'none'
}

const getToolbarButton = (): HTMLButtonElement | null => {
  const button = parent.document.querySelector(toolbarUnmutedSelector) ??
    parent.document.querySelector(toolbarMutedSelector)
  return button as HTMLButtonElement
}

const getFoldedSelfViewButton = (): HTMLButtonElement | null => {
  const button = parent.document.querySelector(foldedSelViewSelector)
  return button as HTMLButtonElement
}

const getSelfViewButton = (): HTMLButtonElement | null => {
  const qualityButton = parent.document.querySelector(qualitySelector)
  if (qualityButton != null) {
    const button = qualityButton.parentNode?.querySelector('button:first-child')
    return button as HTMLButtonElement
  }
  return null
}

export const MainRoomMuteButtons = {
  disable,
  mute,
  isMuted
}

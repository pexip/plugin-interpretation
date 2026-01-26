export const isSameDomain = (): boolean => {
  // Check if the plugin is served from the same domain as Web App 3
  let sameDomain = true
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- no-throw-literal
    parent.document
  } catch (e) {
    sameDomain = false
  }
  return sameDomain
}

export const capitalizeFirstLetter = (value: string): string => {
  const firstIndex = 0
  const secondIndex = 1
  return value.charAt(firstIndex).toUpperCase() + value.slice(secondIndex)
}

export const isIOS = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  // iPad on iOS 13 detection
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document)

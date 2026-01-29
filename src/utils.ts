import { logger } from './logger'

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

export const isIOS = (): boolean => /iPad|iPhone|iPod/.test(navigator.userAgent)

export const pexHash = async (input: string): Promise<string | undefined> => {
  try {
    const hexRadix = 16
    const decRadix = 10
    const pad = 2

    // Convert to byte
    const encoder = new TextEncoder()
    const data = encoder.encode(input)

    // Use crypto of navigator
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    // Convert to hex
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
      .map((b) => b.toString(hexRadix).padStart(pad, '0'))
      .join('')

    // Convert to dec
    const decimal = BigInt('0x' + hashHex).toString(decRadix)

    return decimal
  } catch (error) {
    logger.error(error)
    return undefined
  }
}

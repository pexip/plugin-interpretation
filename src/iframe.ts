import iframeResizer from 'iframe-resizer'

export const initializeIFrame = (): void => {
  const pluginIFrame = getIFrame()
  if (pluginIFrame != null) {
    const { style } = pluginIFrame
    style.position = 'absolute'
    style.display = 'block'
    style.margin = 'auto'
    style.border = '0'
    style.top = '16px'
    style.right = '0'
    style.left = '0'
  }
  // Take out overflow from body
  const [body] = document.getElementsByTagName('body')
  body.style.overflow = 'hidden'

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-argument
  iframeResizer.iframeResizer({ sizeWidth: true }, pluginIFrame as HTMLElement)
}

export const toggleIFramePointerEvents = (enable: boolean): void => {
  const pluginIFrame = getIFrame()
  if (pluginIFrame != null) {
    const { style } = pluginIFrame
    if (enable) {
      style.pointerEvents = 'inherit'
      parent.document.body.style.cursor = 'inherit'
    } else {
      style.pointerEvents = 'none'
      parent.document.body.style.cursor = 'grabbing'
    }
  }
}

export const moveIFrame = (x: number, y: number): void => {
  const pluginIFrame = getIFrame()

  const xMargin = 23
  const yMargin = 20

  let newX = x - xMargin
  let newY = y - yMargin

  if (pluginIFrame != null) {
    const minimum = 0
    newX = Math.max(minimum, newX)
    newY = Math.max(minimum, newY)
    newX = Math.min(
      newX,
      parent.window.innerWidth - parseInt(pluginIFrame.style.width)
    )
    newY = Math.min(
      newY,
      parent.window.innerHeight - parseInt(pluginIFrame.style.height)
    )
    const { style } = pluginIFrame
    style.position = 'absolute'
    style.left = `${newX}px`
    style.top = `${newY}px`
    style.right = 'inherit'
  }
}

const getIFrame = (): HTMLIFrameElement | undefined => {
  const { location } = document
  const { href: url } = location
  const iframes = [...window.parent.document.getElementsByTagName('iframe')]
  const secondPartIndex = 1
  // Ignore the protocol when comparing
  const pluginIFrame = iframes.find(
    (iframe) =>
      iframe.src.split('//')[secondPartIndex] ===
      url.split('//')[secondPartIndex]
  )
  return pluginIFrame
}

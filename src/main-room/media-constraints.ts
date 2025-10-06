import { getInterpretationContext } from '../interpretationContext'
import { logger } from '../logger'

const audioInputKey = 'infinity-connect:audioInput'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- no-unsafe-argument
let mediaConstraints: MediaTrackConstraints =
  localStorage.getItem(audioInputKey) != null
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-argument
      JSON.parse(localStorage.getItem(audioInputKey) as unknown as string)
    : undefined

const getConstraints = (): MediaTrackConstraints | undefined => mediaConstraints

window.addEventListener('storage', (event: StorageEvent) => {
  if (event.key === audioInputKey) {
    if (event.newValue != null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-argument
      const constraints: MediaTrackConstraints = JSON.parse(
        event.newValue
      ) as MediaTrackConstraints
      mediaConstraints = constraints
      getInterpretationContext()
        .changeMediaDevice(constraints)
        .catch(logger.error)
    }
  }
})

export const MainRoomMediaConstraints = {
  get: getConstraints
}

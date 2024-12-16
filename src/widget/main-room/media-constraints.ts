import { getInterpretationContext } from '../interpretationContext'

const audioInputKey = 'infinity-connect:audioInput'

let mediaConstraints: MediaTrackConstraints =
  localStorage.getItem(audioInputKey) != null
    ? JSON.parse(localStorage.getItem(audioInputKey) as unknown as string)
    : undefined

const getConstraints = (): MediaTrackConstraints | undefined => {
  return mediaConstraints
}

window.addEventListener('storage', (event: StorageEvent) => {
  if (event.key === audioInputKey) {
    if (event.newValue != null) {
      const constraints: MediaTrackConstraints = JSON.parse(event.newValue)
      mediaConstraints = constraints
      getInterpretationContext()
        .changeMediaDevice(constraints)
        .catch(console.error)
    }
  }
})

export const MainRoomMediaConstraints = {
  get: getConstraints
}

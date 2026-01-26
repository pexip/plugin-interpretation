const videoMeetingTestId = 'video-meeting'

const videoMeetingSelector = `video[data-testid=${videoMeetingTestId}]`

let currentVolume = 1

const set = (volume: number): void => {
  currentVolume = volume
  setVolume(volume)
}

const refresh = (): void => {
  setVolume(currentVolume)
}

const setVolume = (volume: number): void => {
  const video: HTMLVideoElement | null =
    parent.document.querySelector(videoMeetingSelector)
  if (video != null) {
    video.volume = volume
    const minVolume = 0
    if (volume === minVolume) {
      video.muted = true
    } else {
      video.muted = false
    }
  }
}

export const MainRoomVolume = {
  set,
  refresh
}

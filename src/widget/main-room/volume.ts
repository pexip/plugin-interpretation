const videoMeetingTestId = 'video-meeting'

const videoMeetingSelector = `video[data-testid=${videoMeetingTestId}]`

let currentVolume = 1

const set = (volume: number): void => {
  const video: HTMLVideoElement | null = parent.document.querySelector(videoMeetingSelector)
  if (video != null) {
    video.volume = volume
    currentVolume = volume
  }
}

const refresh = (): void => {
  const video: HTMLVideoElement | null = parent.document.querySelector(videoMeetingSelector)
  if (video != null) {
    video.volume = currentVolume
  }
}

export const MainRoomVolume = {
  set,
  refresh
}

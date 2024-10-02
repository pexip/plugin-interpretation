import { MainRoomMediaConstraints } from './media-constraints'
import { MainRoomMuteButtons } from './mute-buttons'
import { MainRoomVolume } from './volume'

export const MainRoom = {
  getMediaConstraints: MainRoomMediaConstraints.get,
  setMute: MainRoomMuteButtons.mute,
  isMuted: MainRoomMuteButtons.isMuted,
  disableMute: MainRoomMuteButtons.disable,
  setVolume: MainRoomVolume.set,
  refreshVolume: MainRoomVolume.refresh
}

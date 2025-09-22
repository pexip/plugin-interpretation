export const testDevices = [
  {
    deviceId:
      'eca985c54fd3aa20a7b28be863decfaba34a7957a6c6e7a495b9be25264c720a',
    kind: 'audioinput',
    label: 'Logitech Webcam C925e Estéreo analóxico',
    groupId: 'c89f99a26f8aee8736c1fa6a2a2651d3d93ece4910bb0d7083d0a26323072d7a'
  },
  {
    deviceId:
      '2dc3908a31e7521f9036f469264b25eadcc59ed8ba16eae11499a2c8b83f7e95',
    kind: 'audioinput',
    label: 'Jabra Link 380 Mono',
    groupId: '59bd8f480283704cf26e7ad2ea0df96c6d910bbdd8c84c1f0ff6d7f1916f8c32'
  },
  {
    deviceId:
      '1d942876f1e8f738002ee08026b40ed41eca287f3ae943a2996f50e900a8c45b',
    kind: 'videoinput',
    label: 'Logitech Webcam C925e (Camera 1)',
    groupId: 'c89f99a26f8aee8736c1fa6a2a2651d3d93ece4910bb0d7083d0a26323072d7a'
  },
  {
    deviceId:
      '2d942876f1e8f738002ee08026b40ed41eca287f3ae943a2996f50e900a8c45b',
    kind: 'videoinput',
    label: 'Logitech Webcam C925e (Camera 2)',
    groupId: 'c89f99a26f8aee8736c1fa6a2a2651d3d93ece4910bb0d7083d0a26323072d7a'
  },
  {
    deviceId:
      '6aaedb3a7ab0bb8bfad4fedfba08fa9192e0eb4d6ab2b0eeb2153debb1dab46f',
    kind: 'audiooutput',
    label: 'Starship/Matisse HD Audio Controller Estéreo analóxico',
    groupId: '42daa6d8d06a63d26d42ba6fff80e231733e5de519ede3b434fc2ef67b79bf6f'
  },
  {
    deviceId:
      '0861f9a3103a1cbb4f280c1ab6f46ef9e40890cadcc233bddc372d480d2bfc94',
    kind: 'audiooutput',
    label: 'Jabra Link 380 Estéreo analóxico',
    groupId: '59bd8f480283704cf26e7ad2ea0df96c6d910bbdd8c84c1f0ff6d7f1916f8c32'
  },
  {
    deviceId:
      'e0deaf2b4f9df0355430f74783bd5fb31034b18a6e4bce11941aab8fff436b18',
    kind: 'audiooutput',
    label: 'GM206 High Definition Audio Controller Digital Stereo (HDMI 2)',
    groupId: 'd3a1c2c191f8b4de4d4a71196912495b08c0774a952d0f871457de8a3db0ca62'
  }
]
const [defaultAudioTrack] = testDevices
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- no-unsafe-argument
;(window as any).currentAudioTracks = [defaultAudioTrack]

class MediaStream {
  id = '1234'
  active = true
  addTrack = jest.fn()
  getTracks = jest.fn(() => [])
  onaddtrack = jest.fn()
  onremovetrack = jest.fn()
  clone = jest.fn()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- no-unsafe-argument
  getAudioTracks = jest.fn(() => (window as any).currentAudioTracks)
  getTrackById = jest.fn()
  getVideoTracks = jest.fn()
  removeTrack = jest.fn()
  addEventListener = jest.fn()
  removeEventListener = jest.fn()
  dispatchEvent = jest.fn()
}
window.MediaStream = MediaStream

// Also return the same mediaStream. This way is easier to test.
const mediaStream = new MediaStream()

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    enumerateDevices: async () => await Promise.resolve(testDevices),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- no-unsafe-argument
    getUserMedia: async (options: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- no-unsafe-argument
      if (options?.audio.deviceId != null) {
        const devices = testDevices.filter(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- no-unsafe-argument
          (device) => device.deviceId === options.audio.deviceId
        )
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- no-unsafe-argument
        ;(window as any).currentAudioTracks = devices
      }
      return await Promise.resolve(mediaStream)
    }
  }
})

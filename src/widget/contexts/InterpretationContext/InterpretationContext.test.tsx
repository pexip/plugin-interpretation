import React from 'react'
import {
  InterpretationContextProvider,
  useInterpretationContext
} from './InterpretationContext'
import { act, fireEvent, render, screen } from '@testing-library/react'
import type { Language } from '../../types/Language'
import { Direction } from '../../types/Direction'
import { ClientCallType } from '@pexip/infinity'
import { config } from '../config'
import { Role } from '../../types/Role'

require('../__mocks__/mediaDevices')

const pauseStub = jest
  .spyOn(window.HTMLMediaElement.prototype, 'pause')
  .mockImplementation(() => {})

const volumeStub = jest
  .spyOn(window.HTMLMediaElement.prototype, 'volume', 'set')
  .mockImplementation(() => {})

jest.mock('../config', () => ({
  config: {
    role: 'interpreter',
    listener: {
      mainFloorVolume: 80
    }
  }
}))

jest.mock('../user', () => ({
  getUser: () => ({
    displayName: 'user-display-name'
  })
}))

const mockSetButtonActive = jest.fn()
jest.mock('../button', () => ({
  setButtonActive: (active: boolean) => mockSetButtonActive(active)
}))

const french: Language = {
  code: '0033',
  name: 'french'
}

const spanish: Language = {
  code: '0034',
  name: 'spanish'
}

const mockMainRoomGetMediaConstraints = jest.fn()
const mockMainRoomSetMute = jest.fn()
const mockMainRoomIsMuted = jest.fn()
const mockMainRoomDisableMute = jest.fn()
const mockMainRoomSetVolume = jest.fn()
const mockMainRoomRefreshVolume = jest.fn()
jest.mock('../main-room', () => ({
  MainRoom: {
    getMediaConstraints: () => mockMainRoomGetMediaConstraints(),
    setMute: (muted: boolean) => mockMainRoomSetMute(muted),
    isMuted: () => mockMainRoomIsMuted(),
    disableMute: (disabled: boolean) => mockMainRoomDisableMute(disabled),
    setVolume: (volume: number) => mockMainRoomSetVolume(volume),
    refreshVolume: () => mockMainRoomRefreshVolume()
  }
}))

const mockInfinityCall = jest.fn()
const mockInfinityMute = jest.fn()
const mockInfinitySetStream = jest.fn()
const mockInfinityDisconnect = jest.fn()

let protectedByPin = false
let onAuthenticatedWithConferenceCallback: () => void
jest.mock(
  '@pexip/infinity',
  () => {
    return {
      ClientCallType: {
        AudioRecvOnly: 0,
        AudioSendOnly: 1
      },
      createInfinityClientSignals: jest.fn(() => ({
        onAuthenticatedWithConference: {
          add: jest.fn((callback) => {
            onAuthenticatedWithConferenceCallback = callback
          })
        },
        onError: { add: jest.fn() },
        onPinRequired: { add: jest.fn() }
      })),
      createCallSignals: jest.fn(() => ({
        onRemoteStream: { add: jest.fn() }
      })),
      createInfinityClient: jest.fn(() => ({
        call: (params: any) => {
          mockInfinityCall(params)
          if (!protectedByPin) {
            onAuthenticatedWithConferenceCallback()
          }
        },
        mute: (params: any) => {
          mockInfinityMute(params)
        },
        setStream: (params: any) => {
          mockInfinitySetStream(params)
        },
        disconnect: (params: any) => {
          mockInfinityDisconnect(params)
        }
      }))
    }
  },
  { virtual: true }
)

let newVolume: number = 0
const InterpretationContextTester = (): JSX.Element => {
  const {
    connect,
    disconnect,
    changeMediaDevice,
    changeLanguage,
    changeDirection,
    changeMute,
    changeVolume,
    minimize,
    state
  } = useInterpretationContext()
  const { role, connected, language, direction, muted, volume, minimized } =
    state
  return (
    <div data-testid="InterpretationContextTester">
      <span data-testid="role">{role}</span>
      <span data-testid="connected">{connected.toString()}</span>
      <span data-testid="language">{JSON.stringify(language)}</span>
      <span data-testid="direction">{direction}</span>
      <span data-testid="muted">{muted.toString()}</span>
      <span data-testid="volume">{volume}</span>
      <span data-testid="minimized">{minimized.toString()}</span>
      <button
        data-testid="connect"
        onClick={() => {
          connect(french).catch((e) => {
            console.error(e)
          })
        }}
      />
      <button
        data-testid="disconnect"
        onClick={() => {
          disconnect().catch((e) => {
            console.error(e)
          })
        }}
      />
      <button
        data-testid="changeMediaDevice"
        onClick={() => {
          changeMediaDevice({}).catch((e) => {
            console.error(e)
          })
        }}
      />
      <button
        data-testid="changeLanguage"
        onClick={() => {
          changeLanguage(spanish).catch((e) => {
            console.error(e)
          })
        }}
      />
      <button
        data-testid="changeDirection"
        onClick={() => {
          changeDirection(
            direction === Direction.InterpretationToMainRoom
              ? Direction.MainRoomToInterpretation
              : Direction.InterpretationToMainRoom
          ).catch((e) => {
            console.error(e)
          })
        }}
      />
      <button
        data-testid="changeMute"
        onClick={() => {
          changeMute(!muted).catch((e) => {
            console.error(e)
          })
        }}
      />
      <button
        data-testid="changeVolume"
        onClick={() => {
          changeVolume(newVolume)
        }}
      />
      <button
        data-testid="minimize"
        onClick={() => {
          minimize(true)
        }}
      />
    </div>
  )
}

describe('InterpretationContext', () => {
  beforeEach(() => {
    mockMainRoomGetMediaConstraints.mockClear()
    mockMainRoomSetMute.mockClear()
    mockMainRoomIsMuted.mockClear()
    mockMainRoomDisableMute.mockClear()
    mockMainRoomSetVolume.mockClear()
    mockMainRoomRefreshVolume.mockClear()
    mockInfinityCall.mockClear()
    mockInfinityMute.mockClear()
    mockInfinitySetStream.mockClear()
    mockInfinityDisconnect.mockClear()
    mockSetButtonActive.mockClear()
    pauseStub.mockClear()
    volumeStub.mockClear()
  })

  it('should create a context', () => {
    render(
      <InterpretationContextProvider>
        <InterpretationContextTester />
      </InterpretationContextProvider>
    )
    const tester = screen.getByTestId('InterpretationContextTester')
    expect(tester).toBeInTheDocument()
  })

  describe('connect', () => {
    describe('interpreter', () => {
      beforeEach(async () => {
        config.role = Role.Interpreter
        render(
          <InterpretationContextProvider>
            <InterpretationContextTester />
          </InterpretationContextProvider>
        )
        await act(async () => {
          const button = screen.getByTestId('connect')
          fireEvent.click(button)
        })
      })

      it('should use callType=AudioSendOnly', async () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(1)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            callType: ClientCallType.AudioSendOnly
          })
        )
      })

      it('should add " - Interpreter" at the end of the displayName', async () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(1)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            displayName: 'user-display-name - Interpreter'
          })
        )
      })

      it('should pass a mediaStream', async () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(1)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            mediaStream: expect.objectContaining({
              active: true
            })
          })
        )
      })
    })

    describe('listener', () => {
      beforeEach(async () => {
        config.role = Role.Listener
        render(
          <InterpretationContextProvider>
            <InterpretationContextTester />
          </InterpretationContextProvider>
        )
        await act(async () => {
          const button = screen.getByTestId('connect')
          fireEvent.click(button)
        })
      })

      it('should use callType=AudioRecvOnly', async () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(1)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            callType: ClientCallType.AudioRecvOnly
          })
        )
      })

      it('should add " - Listener" at the end of the displayName', async () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(1)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            displayName: 'user-display-name - Listener'
          })
        )
      })

      it("should't pass a mediaStream", async () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(1)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            mediaStream: undefined
          })
        )
      })
    })

    describe('protected by pin', () => {
      beforeAll(async () => {
        protectedByPin = true
        render(
          <InterpretationContextProvider>
            <InterpretationContextTester />
          </InterpretationContextProvider>
        )
        await act(async () => {
          const button = screen.getByTestId('connect')
          fireEvent.click(button)
        })
      })

      it('should set the correct states', async () => {
        const expectedConnected = false
        const expectedLanguage = french
        const expectedVolume = 80
        const expectedDirection = Direction.MainRoomToInterpretation

        const connected = screen.getByTestId('connected')
        expect(connected.innerHTML).toBe(expectedConnected.toString())
        const language = screen.getByTestId('language')
        expect(language.innerHTML).toBe(JSON.stringify(expectedLanguage))
        const volume = screen.getByTestId('volume')
        expect(volume.innerHTML).toBe(expectedVolume.toString())
        const direction = screen.getByTestId('direction')
        expect(direction.innerHTML).toBe(expectedDirection)
      })
    })

    describe('unprotected by pin', () => {
      beforeAll(async () => {
        protectedByPin = false
        render(
          <InterpretationContextProvider>
            <InterpretationContextTester />
          </InterpretationContextProvider>
        )
        await act(async () => {
          const button = screen.getByTestId('connect')
          fireEvent.click(button)
        })
      })

      it('should set the correct states', async () => {
        const expectedConnected = true
        const expectedLanguage = french
        const expectedVolume = 80
        const expectedDirection = Direction.MainRoomToInterpretation

        const connected = screen.getByTestId('connected')
        expect(connected.innerHTML).toBe(expectedConnected.toString())
        const language = screen.getByTestId('language')
        expect(language.innerHTML).toBe(JSON.stringify(expectedLanguage))
        const volume = screen.getByTestId('volume')
        expect(volume.innerHTML).toBe(expectedVolume.toString())
        const direction = screen.getByTestId('direction')
        expect(direction.innerHTML).toBe(expectedDirection)
      })
    })

    describe('handleConnected', () => {
      describe('interpreter', () => {
        beforeEach(async () => {
          protectedByPin = true
          config.role = Role.Interpreter
          render(
            <InterpretationContextProvider>
              <InterpretationContextTester />
            </InterpretationContextProvider>
          )
          await act(async () => {
            const button = screen.getByTestId('connect')
            fireEvent.click(button)
          })
        })

        it('should change the state to connected', async () => {
          await act(async () => {
            onAuthenticatedWithConferenceCallback()
          })
          const connected = screen.getByTestId('connected')
          expect(connected.innerHTML).toBe('true')
        })

        it('should disable the main room mute', async () => {
          await act(async () => {
            onAuthenticatedWithConferenceCallback()
          })
          expect(mockMainRoomDisableMute).toHaveBeenCalledTimes(1)
          expect(mockMainRoomDisableMute).toHaveBeenCalledWith(true)
        })

        it('should change the toolbar button to active', async () => {
          await act(async () => {
            onAuthenticatedWithConferenceCallback()
          })
          expect(mockSetButtonActive).toHaveBeenCalledTimes(1)
          expect(mockSetButtonActive).toHaveBeenLastCalledWith(true)
        })

        describe('main room unmuted', () => {
          beforeEach(async () => {
            mockMainRoomIsMuted.mockReturnValue(false)
            await act(async () => {
              onAuthenticatedWithConferenceCallback()
            })
          })

          it('should mute the main room if not muted before', async () => {
            expect(mockMainRoomSetMute).toHaveBeenCalledTimes(1)
            expect(mockMainRoomSetMute).toHaveBeenCalledWith(true)
          })

          it("shouldn't mute the interpretation room", () => {
            expect(mockInfinityMute).not.toHaveBeenCalled()
          })
        })

        describe('main room muted', () => {
          beforeEach(async () => {
            mockMainRoomIsMuted.mockReturnValue(true)
            await act(async () => {
              onAuthenticatedWithConferenceCallback()
            })
          })

          it("shouldn't mute the main room", async () => {
            expect(mockMainRoomSetMute).not.toHaveBeenCalled()
          })

          it('should mute the interpretation room', () => {
            expect(mockInfinityMute).toHaveBeenCalledTimes(1)
            expect(mockInfinityMute).toHaveBeenCalledWith({ mute: true })
          })
        })
      })

      describe('listener', () => {
        const renderConnectedListenerTest = async (): Promise<void> => {
          config.role = Role.Listener
          protectedByPin = true
          render(
            <InterpretationContextProvider>
              <InterpretationContextTester />
            </InterpretationContextProvider>
          )
          await act(async () => {
            const button = screen.getByTestId('connect')
            fireEvent.click(button)
          })
          await act(async () => {
            onAuthenticatedWithConferenceCallback()
          })
        }

        it('should change the state to connected', async () => {
          await renderConnectedListenerTest()
          const connected = screen.getByTestId('connected')
          expect(connected.innerHTML).toBe('true')
        })

        describe('speakToInterpretationRoom === false', () => {
          it("shouldn't disable the main room mute", async () => {
            config.listener.speakToInterpretationRoom = false
            await renderConnectedListenerTest()
            expect(mockMainRoomDisableMute).not.toHaveBeenCalled()
          })
        })

        describe('speakToInterpretationRoom === true', () => {
          it('should disable the main room mute', async () => {
            config.listener.speakToInterpretationRoom = true
            await renderConnectedListenerTest()
            expect(mockMainRoomDisableMute).toHaveBeenCalledTimes(1)
            expect(mockMainRoomDisableMute).toHaveBeenCalledWith(true)
          })
        })
      })
    })
  })

  describe('disconnect', () => {
    const renderDisconnectionTest = async (
      shouldMuteInterpretation = false
    ): Promise<void> => {
      config.role = Role.Interpreter
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )

      await act(async () => {
        onAuthenticatedWithConferenceCallback()
      })
      await act(async () => {
        if (shouldMuteInterpretation) {
          const buttonMute = screen.getByTestId('changeMute')
          fireEvent.click(buttonMute)
        }
      })
      await act(async () => {
        const buttonDisconnect = screen.getByTestId('disconnect')
        fireEvent.click(buttonDisconnect)
      })
    }

    it('should change the state to disconnected', async () => {
      await renderDisconnectionTest()
      const connected = screen.getByTestId('connected')
      expect(connected.innerHTML).toBe('false')
    })

    it('should pause the audio', async () => {
      await renderDisconnectionTest()
      expect(pauseStub).toHaveBeenCalledTimes(1)
    })

    it('should call infinityClient.disconnect', async () => {
      await renderDisconnectionTest()
      expect(mockInfinityDisconnect).toHaveBeenCalledTimes(1)
      expect(mockInfinityDisconnect).toHaveBeenCalledWith({
        reason: 'User initiated disconnect'
      })
    })

    it('should set the volume in the main room to 1', async () => {
      await renderDisconnectionTest()
      expect(mockMainRoomSetVolume).toHaveBeenCalledTimes(1)
      expect(mockMainRoomSetVolume).toHaveBeenCalledWith(1)
    })

    it('should enable the mute buttons', async () => {
      await renderDisconnectionTest()
      expect(mockMainRoomDisableMute).toHaveBeenCalledTimes(2)
      expect(mockMainRoomDisableMute).toHaveBeenCalledWith(false)
    })

    it('should change the toolbar button to active', async () => {
      await renderDisconnectionTest()
      expect(mockSetButtonActive).toHaveBeenCalledTimes(2)
      expect(mockSetButtonActive).toHaveBeenLastCalledWith(false)
    })

    it('should come back to the main room unmuted if the interpretation was unmuted', async () => {
      await renderDisconnectionTest()
      expect(mockMainRoomSetMute).toHaveBeenCalledTimes(1)
      expect(mockMainRoomSetMute).toHaveBeenCalledWith(false)
    })

    it('should come back to the main room muted if the interpretation was muted', async () => {
      const shouldMuteInterpretation = true
      await renderDisconnectionTest(shouldMuteInterpretation)
      expect(mockMainRoomSetMute).toHaveBeenCalledTimes(1)
      expect(mockMainRoomSetMute).toHaveBeenCalledWith(true)
    })
  })

  describe('changeMediaDevice', () => {
    it('should call setStream if connected', async () => {
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )
      await act(async () => {
        const button = screen.getByTestId('connect')
        fireEvent.click(button)
      })
      await act(async () => {
        onAuthenticatedWithConferenceCallback()
      })
      await act(async () => {
        const button = screen.getByTestId('changeMediaDevice')
        fireEvent.click(button)
      })
      expect(mockInfinitySetStream).toHaveBeenCalledTimes(1)
    })

    it("shouldn't do anything if not connected", async () => {
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )
      await act(async () => {
        const button = screen.getByTestId('changeMediaDevice')
        fireEvent.click(button)
      })
      expect(mockInfinitySetStream).not.toHaveBeenCalled()
    })
  })

  describe('changeLanguage', () => {
    beforeEach(async () => {
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )
    })

    it('should have the default language to null', () => {
      const language = screen.getByTestId('language')
      expect(language.innerHTML).toBe('null')
    })

    it('should have the default language to "spanish"', async () => {
      const button = screen.getByTestId('changeLanguage')
      await act(async () => {
        fireEvent.click(button)
      })
      const language = screen.getByTestId('language')
      expect(language.innerHTML).toBe(JSON.stringify(spanish))
    })
  })

  describe('changeDirection', () => {
    beforeEach(async () => {
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )
    })

    it('should have the default direction to "MainRoomToInterpretation"', () => {
      const language = screen.getByTestId('direction')
      expect(language.innerHTML).toBe(Direction.MainRoomToInterpretation)
    })

    describe('InterpretationToMainRoom', () => {
      it('should change the direction to "InterpretationToMainRoom"', async () => {
        const button = screen.getByTestId('changeDirection')
        await act(async () => {
          fireEvent.click(button)
        })
        const language = screen.getByTestId('direction')
        expect(language.innerHTML).toBe(Direction.InterpretationToMainRoom)
      })

      it('should unmute the main room', async () => {
        const button = screen.getByTestId('changeDirection')
        await act(async () => {
          fireEvent.click(button)
        })
        expect(mockMainRoomSetMute).toHaveBeenCalledTimes(1)
        expect(mockMainRoomSetMute).toHaveBeenCalledWith(false)
      })

      it('should mute the interpretation room', async () => {
        const button = screen.getByTestId('changeDirection')
        await act(async () => {
          fireEvent.click(button)
        })
        expect(mockInfinityMute).toHaveBeenCalledTimes(1)
        expect(mockInfinityMute).toHaveBeenCalledWith({ mute: true })
      })
    })

    describe('MainRoomToInterpretation', () => {
      it('should change the direction to "MainRoomToInterpretation"', async () => {
        const button = screen.getByTestId('changeDirection')
        await act(async () => {
          fireEvent.click(button)
        })
        await act(async () => {
          fireEvent.click(button)
        })
        const language = screen.getByTestId('direction')
        expect(language.innerHTML).toBe(Direction.MainRoomToInterpretation)
      })

      it('should mute the main room', async () => {
        const button = screen.getByTestId('changeDirection')
        await act(async () => {
          fireEvent.click(button)
        })
        await act(async () => {
          fireEvent.click(button)
        })
        expect(mockMainRoomSetMute).toHaveBeenCalledTimes(2)
        expect(mockMainRoomSetMute).toHaveBeenCalledWith(true)
      })

      it('should unmute the interpretation room', async () => {
        const button = screen.getByTestId('changeDirection')
        await act(async () => {
          fireEvent.click(button)
        })
        await act(async () => {
          fireEvent.click(button)
        })
        expect(mockInfinityMute).toHaveBeenCalledTimes(2)
        expect(mockInfinityMute).toHaveBeenCalledWith({ mute: false })
      })
    })
  })

  describe('changeMute', () => {
    beforeEach(async () => {
      config.role = Role.Listener
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )
    })

    it('should be unmuted by default', () => {
      const muted = screen.getByTestId('muted')
      expect(muted.innerHTML).toBe('false')
    })

    it('should be muted when clicked', async () => {
      const button = screen.getByTestId('changeMute')
      await act(async () => {
        fireEvent.click(button)
      })
      const muted = screen.getByTestId('muted')
      expect(muted.innerHTML).toBe('true')
    })
  })

  describe('changeVolume', () => {
    beforeEach(async () => {
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )
    })

    it('should get the default value from the config file', () => {
      const volume = screen.getByTestId('volume')
      expect(volume.innerHTML).toBe('80')
    })

    it('should change the volume when clicked', async () => {
      newVolume = 70
      const button = screen.getByTestId('changeVolume')
      await act(async () => {
        fireEvent.click(button)
      })
      const volume = screen.getByTestId('volume')
      expect(volume.innerHTML).toBe(newVolume.toString())
    })

    describe('mainRoom volume', () => {
      it('should be 1 when volume==0%', async () => {
        newVolume = 0
        const button = screen.getByTestId('changeVolume')
        await act(async () => {
          fireEvent.click(button)
        })
        expect(mockMainRoomSetVolume).toHaveBeenCalledTimes(1)
        expect(mockMainRoomSetVolume).toHaveBeenCalledWith(1)
      })

      it('should be 1 when volume==50%', async () => {
        newVolume = 50
        const button = screen.getByTestId('changeVolume')
        await act(async () => {
          fireEvent.click(button)
        })
        expect(mockMainRoomSetVolume).toHaveBeenCalledTimes(1)
        expect(mockMainRoomSetVolume).toHaveBeenCalledWith(1)
      })

      it('should be 0 when volume==100%', async () => {
        newVolume = 100
        const button = screen.getByTestId('changeVolume')
        await act(async () => {
          fireEvent.click(button)
        })
        expect(mockMainRoomSetVolume).toHaveBeenCalledTimes(1)
        expect(mockMainRoomSetVolume).toHaveBeenCalledWith(0)
      })
    })

    describe('interpretation volume', () => {
      it('should be 0 when volume==0%', async () => {
        newVolume = 0
        const button = screen.getByTestId('changeVolume')
        await act(async () => {
          fireEvent.click(button)
        })
        expect(volumeStub).toHaveBeenCalledTimes(1)
        expect(volumeStub).toHaveBeenCalledWith(0)
      })

      it('should be 1 when volume==50%', async () => {
        newVolume = 50
        const button = screen.getByTestId('changeVolume')
        await act(async () => {
          fireEvent.click(button)
        })
        expect(volumeStub).toHaveBeenCalledTimes(1)
        expect(volumeStub).toHaveBeenCalledWith(1)
      })

      it('should be 1 when volume==100%', async () => {
        newVolume = 50
        const button = screen.getByTestId('changeVolume')
        await act(async () => {
          fireEvent.click(button)
        })
        expect(volumeStub).toHaveBeenCalledTimes(1)
        expect(volumeStub).toHaveBeenCalledWith(1)
      })
    })
  })

  describe('minimize', () => {
    beforeEach(async () => {
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )
    })

    it('should be not be minimized by default', () => {
      const minimized = screen.getByTestId('minimized')
      expect(minimized.innerHTML).toBe('false')
    })

    it('should be minimized when clicked', async () => {
      const button = screen.getByTestId('minimize')
      await act(async () => {
        fireEvent.click(button)
      })
      const minimized = screen.getByTestId('minimized')
      expect(minimized.innerHTML).toBe('true')
    })
  })
})

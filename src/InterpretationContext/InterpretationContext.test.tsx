/* eslint-disable max-lines -- we will disable this rule for now */
/* eslint-disable max-nested-callbacks -- we need to nest more for the tests */
import React from 'react'
import {
  InterpretationContextProvider,
  useInterpretationContext
} from './InterpretationContext'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Language } from '../types/Language'
import { Direction } from '../types/Direction'
import { ClientCallType } from '@pexip/infinity'
import { config } from '../config'
import { Role } from '../types/Role'
import { logger } from '../logger'
import { setMainConferenceAlias } from '../conference'

// eslint-disable-next-line @typescript-eslint/no-require-imports -- we need to require the mediaDevices polyfill
require('../__mocks__/mediaDevices')

jest.mock('pino', () => ({
  __esModule: true,
  default: () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn()
  })
}))

const pauseStub = jest
  .spyOn(window.HTMLMediaElement.prototype, 'pause')
  .mockImplementation(() => undefined)

const volumeStub = jest
  .spyOn(window.HTMLMediaElement.prototype, 'volume', 'set')
  .mockImplementation(() => undefined)

jest.mock('../config', () => {
  const mainFloorVolume = 80
  return {
    config: {
      role: 'interpreter',
      listener: { mainFloorVolume }
    }
  }
})

let mockUser = {}
jest.mock('../user', () => ({
  getUser: () => mockUser
}))

const mockSetButtonActive = jest.fn()
jest.mock('../button', () => ({
  setButtonActive: (active: boolean) => {
    mockSetButtonActive(active)
  }
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
    getMediaConstraints: () => mockMainRoomGetMediaConstraints() as unknown,
    setMute: (muted: boolean) => {
      mockMainRoomSetMute(muted)
    },
    isMuted: () => mockMainRoomIsMuted() as unknown,
    disableMute: (disabled: boolean) => {
      mockMainRoomDisableMute(disabled)
    },
    setVolume: (volume: number) => {
      mockMainRoomSetVolume(volume)
    },
    refreshVolume: () => {
      mockMainRoomRefreshVolume()
    }
  }
}))

const mockInfinityCall = jest.fn()
const mockInfinityMute = jest.fn()
const mockInfinitySetStream = jest.fn()
const mockInfinityDisconnect = jest.fn()

let protectedByPin = false
let onAuthenticatedWithConferenceCallback: () => void = () => undefined
jest.mock(
  '@pexip/infinity',
  () => {
    const AudioRecvOnly = 0
    const AudioSendOnly = 1
    return {
      ClientCallType: {
        AudioRecvOnly,
        AudioSendOnly
      },
      createInfinityClientSignals: jest.fn(() => ({
        onAuthenticatedWithConference: {
          add: jest.fn((callback) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- no-unsafe-argument
            onAuthenticatedWithConferenceCallback = callback
          })
        },
        onError: { add: jest.fn() },
        onPinRequired: { add: jest.fn() },
        onDisconnected: { add: jest.fn() }
      })),
      createCallSignals: jest.fn(() => ({
        onRemoteStream: { add: jest.fn() }
      })),
      createInfinityClient: jest.fn(() => ({
        call: (params: unknown) => {
          mockInfinityCall(params)
          if (!protectedByPin) {
            onAuthenticatedWithConferenceCallback()
          }
        },
        mute: (params: unknown) => {
          mockInfinityMute(params)
        },
        setStream: (params: unknown) => {
          mockInfinitySetStream(params)
        },
        disconnect: (params: unknown) => {
          mockInfinityDisconnect(params)
        }
      }))
    }
  },
  { virtual: true }
)

let newVolume = 0
const InterpretationContextTester = (): React.JSX.Element => {
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
          connect(french).catch(logger.error)
        }}
      />
      <button
        data-testid="disconnect"
        onClick={() => {
          disconnect().catch(logger.error)
        }}
      />
      <button
        data-testid="changeMediaDevice"
        onClick={() => {
          changeMediaDevice({}).catch(logger.error)
        }}
      />
      <button
        data-testid="changeLanguage"
        onClick={() => {
          changeLanguage(spanish).catch(logger.error)
        }}
      />
      <button
        data-testid="changeDirection"
        onClick={() => {
          changeDirection(
            direction === Direction.InterpretationToMainRoom
              ? Direction.MainRoomToInterpretation
              : Direction.InterpretationToMainRoom
          ).catch(logger.error)
        }}
      />
      <button
        data-testid="changeMute"
        onClick={() => {
          changeMute(!muted).catch(logger.error)
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

const CALLED_ONCE = 1
const CALLED_TWICE = 2

describe('InterpretationContext', () => {
  beforeAll(() => {
    setMainConferenceAlias('test-conference-alias')
  })
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
    mockUser = {
      displayName: 'user-display-name',
      rawData: {}
    }
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
        const { Interpreter } = Role
        config.role = Interpreter
        render(
          <InterpretationContextProvider>
            <InterpretationContextTester />
          </InterpretationContextProvider>
        )
        await waitFor(() => {
          const button = screen.getByTestId('connect')
          fireEvent.click(button)
        })
      })

      it('should use callType=AudioSendOnly', () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(CALLED_ONCE)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            callType: ClientCallType.AudioSendOnly
          })
        )
      })

      it('should add " - Interpreter" at the end of the displayName', () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(CALLED_ONCE)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            displayName: 'user-display-name - Interpreter'
          })
        )
      })

      it('should pass a mediaStream', () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(CALLED_ONCE)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-assertion
            mediaStream: expect.objectContaining({
              active: true
            }) as MediaStream
          })
        )
      })
    })

    describe('listener', () => {
      beforeEach(async () => {
        const { Listener } = Role
        config.role = Listener
        render(
          <InterpretationContextProvider>
            <InterpretationContextTester />
          </InterpretationContextProvider>
        )
        await waitFor(() => {
          const button = screen.getByTestId('connect')
          fireEvent.click(button)
        })
      })

      it('should use callType=AudioRecvOnly', () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(CALLED_ONCE)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            callType: ClientCallType.AudioRecvOnly
          })
        )
      })

      it('should add " - Listener" at the end of the displayName', () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(CALLED_ONCE)
        expect(mockInfinityCall).toHaveBeenCalledWith(
          expect.objectContaining({
            displayName: 'user-display-name - Listener'
          })
        )
      })

      it("should't pass a mediaStream", () => {
        expect(mockInfinityCall).toHaveBeenCalledTimes(CALLED_ONCE)
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
        await waitFor(() => {
          const button = screen.getByTestId('connect')
          fireEvent.click(button)
        })
      })

      it('should set the correct states', () => {
        const expectedConnected = false
        const expectedLanguage = french
        const expectedVolume = 80
        const { MainRoomToInterpretation } = Direction
        const expectedDirection = MainRoomToInterpretation

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
        await waitFor(() => {
          const button = screen.getByTestId('connect')
          fireEvent.click(button)
        })
      })

      it('should set the correct states', () => {
        const expectedConnected = true
        const expectedLanguage = french
        const expectedVolume = 80
        const { MainRoomToInterpretation: expectedDirection } = Direction

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
          const { Interpreter } = Role
          config.role = Interpreter
          render(
            <InterpretationContextProvider>
              <InterpretationContextTester />
            </InterpretationContextProvider>
          )
          await waitFor(() => {
            const button = screen.getByTestId('connect')
            fireEvent.click(button)
          })
        })

        it('should change the state to connected', async () => {
          await waitFor(onAuthenticatedWithConferenceCallback)
          const connected = screen.getByTestId('connected')
          expect(connected.innerHTML).toBe('true')
        })

        it('should disable the main room mute', async () => {
          await waitFor(onAuthenticatedWithConferenceCallback)
          expect(mockMainRoomDisableMute).toHaveBeenCalledTimes(CALLED_ONCE)
          expect(mockMainRoomDisableMute).toHaveBeenCalledWith(true)
        })

        it('should change the toolbar button to active', async () => {
          await waitFor(onAuthenticatedWithConferenceCallback)
          expect(mockSetButtonActive).toHaveBeenCalledTimes(CALLED_ONCE)
          expect(mockSetButtonActive).toHaveBeenLastCalledWith(true)
        })

        describe('main room unmuted', () => {
          beforeEach(async () => {
            mockMainRoomIsMuted.mockReturnValue(false)
            await waitFor(onAuthenticatedWithConferenceCallback)
          })

          it('should mute the main room if not muted before', () => {
            expect(mockMainRoomSetMute).toHaveBeenCalledTimes(CALLED_ONCE)
            expect(mockMainRoomSetMute).toHaveBeenCalledWith(true)
          })

          it("shouldn't mute the interpretation room", () => {
            expect(mockInfinityMute).not.toHaveBeenCalled()
          })
        })

        describe('main room muted', () => {
          beforeEach(async () => {
            mockMainRoomIsMuted.mockReturnValue(true)
            await waitFor(onAuthenticatedWithConferenceCallback)
          })

          it("shouldn't mute the main room", () => {
            expect(mockMainRoomSetMute).not.toHaveBeenCalled()
          })

          it('should mute the interpretation room', () => {
            expect(mockInfinityMute).toHaveBeenCalledTimes(CALLED_ONCE)
            expect(mockInfinityMute).toHaveBeenCalledWith({ mute: true })
          })
        })
      })

      describe('listener', () => {
        const renderConnectedListenerTest = async (): Promise<void> => {
          const { Listener } = Role
          config.role = Listener
          protectedByPin = true
          render(
            <InterpretationContextProvider>
              <InterpretationContextTester />
            </InterpretationContextProvider>
          )
          await waitFor(() => {
            const button = screen.getByTestId('connect')
            fireEvent.click(button)
          })
          await waitFor(onAuthenticatedWithConferenceCallback)
        }

        it('should change the state to connected', async () => {
          await renderConnectedListenerTest()
          const connected = screen.getByTestId('connected')
          expect(connected.innerHTML).toBe('true')
        })

        describe('speakToInterpretationRoom === false', () => {
          it("shouldn't disable the main room mute", async () => {
            if (config.listener != null) {
              config.listener.speakToInterpretationRoom = false
            }
            await renderConnectedListenerTest()
            expect(mockMainRoomDisableMute).not.toHaveBeenCalled()
          })
        })

        describe('speakToInterpretationRoom === true', () => {
          it('should disable the main room mute', async () => {
            if (config.listener != null) {
              config.listener.speakToInterpretationRoom = true
            }
            await renderConnectedListenerTest()
            expect(mockMainRoomDisableMute).toHaveBeenCalledTimes(CALLED_ONCE)
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
      const { Interpreter } = Role
      config.role = Interpreter
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )

      await waitFor(onAuthenticatedWithConferenceCallback)
      await waitFor(() => {
        if (shouldMuteInterpretation) {
          const buttonMute = screen.getByTestId('changeMute')
          fireEvent.click(buttonMute)
        }
      })
      await waitFor(() => {
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
      expect(pauseStub).toHaveBeenCalledTimes(CALLED_ONCE)
    })

    it('should call infinityClient.disconnect', async () => {
      await renderDisconnectionTest()
      expect(mockInfinityDisconnect).toHaveBeenCalledTimes(CALLED_ONCE)
      expect(mockInfinityDisconnect).toHaveBeenCalledWith({
        reason: 'User initiated disconnect'
      })
    })

    it('should set the volume in the main room to 1', async () => {
      await renderDisconnectionTest()
      expect(mockMainRoomSetVolume).toHaveBeenCalledTimes(CALLED_ONCE)
      const expectedVolume = 1
      expect(mockMainRoomSetVolume).toHaveBeenCalledWith(expectedVolume)
    })

    it('should enable the mute buttons', async () => {
      await renderDisconnectionTest()
      expect(mockMainRoomDisableMute).toHaveBeenCalledTimes(CALLED_TWICE)
      expect(mockMainRoomDisableMute).toHaveBeenCalledWith(false)
    })

    it('should change the toolbar button to active', async () => {
      await renderDisconnectionTest()
      expect(mockSetButtonActive).toHaveBeenCalledTimes(CALLED_TWICE)
      expect(mockSetButtonActive).toHaveBeenLastCalledWith(false)
    })

    it('should come back to the main room unmuted if the interpretation was unmuted', async () => {
      await renderDisconnectionTest()
      expect(mockMainRoomSetMute).toHaveBeenCalledTimes(CALLED_ONCE)
      expect(mockMainRoomSetMute).toHaveBeenCalledWith(false)
    })

    it('should come back to the main room muted if the interpretation was muted', async () => {
      const shouldMuteInterpretation = true
      await renderDisconnectionTest(shouldMuteInterpretation)
      expect(mockMainRoomSetMute).toHaveBeenCalledTimes(CALLED_ONCE)
      const muted = screen.getByTestId('muted')
      expect(muted.innerHTML).toBe('true')
    })
  })

  describe('changeMediaDevice', () => {
    it('should call setStream if connected', async () => {
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )
      await waitFor(() => {
        const button = screen.getByTestId('connect')
        fireEvent.click(button)
      })
      await waitFor(onAuthenticatedWithConferenceCallback)
      await waitFor(() => {
        const button = screen.getByTestId('changeMediaDevice')
        fireEvent.click(button)
      })
      expect(mockInfinitySetStream).toHaveBeenCalledTimes(CALLED_ONCE)
    })

    it("shouldn't do anything if not connected", async () => {
      render(
        <InterpretationContextProvider>
          <InterpretationContextTester />
        </InterpretationContextProvider>
      )
      await waitFor(() => {
        const button = screen.getByTestId('changeMediaDevice')
        fireEvent.click(button)
      })
      expect(mockInfinitySetStream).not.toHaveBeenCalled()
    })
  })

  describe('changeLanguage', () => {
    beforeEach(() => {
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
      await waitFor(() => {
        const button = screen.getByTestId('changeLanguage')
        fireEvent.click(button)
      })
      await waitFor(() => {
        const language = screen.getByTestId('language')
        expect(language.innerHTML).toBe(JSON.stringify(spanish))
      })
    })
  })

  describe('changeDirection', () => {
    beforeEach(() => {
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
        await waitFor(() => {
          const button = screen.getByTestId('changeDirection')
          fireEvent.click(button)
        })
        await waitFor(() => {
          const language = screen.getByTestId('direction')
          expect(language.innerHTML).toBe(Direction.InterpretationToMainRoom)
        })
      })

      it('should unmute the main room', async () => {
        const button = screen.getByTestId('changeDirection')
        await waitFor(() => {
          fireEvent.click(button)
        })
        expect(mockMainRoomSetMute).toHaveBeenCalledTimes(CALLED_ONCE)
        expect(mockMainRoomSetMute).toHaveBeenCalledWith(false)
      })

      it('should mute the interpretation room', async () => {
        const button = screen.getByTestId('changeDirection')
        await waitFor(() => {
          fireEvent.click(button)
        })
        await waitFor(() => {
          expect(mockInfinityMute).toHaveBeenCalledTimes(CALLED_ONCE)
          expect(mockInfinityMute).toHaveBeenCalledWith({ mute: true })
        })
      })
    })

    describe('MainRoomToInterpretation', () => {
      it('should change the direction to "MainRoomToInterpretation"', async () => {
        await waitFor(() => {
          const button = screen.getByTestId('changeDirection')
          fireEvent.click(button)
          fireEvent.click(button)
        })
        const language = screen.getByTestId('direction')
        expect(language.innerHTML).toBe(Direction.MainRoomToInterpretation)
      })

      it('should mute the main room', async () => {
        const button = screen.getByTestId('changeDirection')
        await waitFor(() => {
          fireEvent.click(button)
        })
        await waitFor(() => {
          fireEvent.click(button)
        })
        expect(mockMainRoomSetMute).toHaveBeenCalledTimes(CALLED_TWICE)
        expect(mockMainRoomSetMute).toHaveBeenCalledWith(true)
      })

      it('should unmute the interpretation room', async () => {
        const button = screen.getByTestId('changeDirection')
        await waitFor(() => {
          fireEvent.click(button)
        })
        await waitFor(() => {
          fireEvent.click(button)
        })
        expect(mockInfinityMute).toHaveBeenCalledTimes(CALLED_TWICE)
        expect(mockInfinityMute).toHaveBeenCalledWith({ mute: false })
      })
    })
  })

  describe('changeMute', () => {
    beforeEach(() => {
      const { Listener } = Role
      config.role = Listener
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
      await waitFor(() => {
        const button = screen.getByTestId('changeMute')
        fireEvent.click(button)
      })
      await waitFor(() => {
        const muted = screen.getByTestId('muted')
        expect(muted.innerHTML).toBe('true')
      })
    })
  })

  describe('changeVolume', () => {
    beforeEach(() => {
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
      const highVolume = 70
      newVolume = highVolume
      const button = screen.getByTestId('changeVolume')
      await waitFor(() => {
        fireEvent.click(button)
      })
      const volume = screen.getByTestId('volume')
      expect(volume.innerHTML).toBe(newVolume.toString())
    })

    describe('mainRoom volume', () => {
      it('should be 1 when volume==0%', async () => {
        const minVolume = 0
        newVolume = minVolume
        const button = screen.getByTestId('changeVolume')
        await waitFor(() => {
          fireEvent.click(button)
        })
        expect(mockMainRoomSetVolume).toHaveBeenCalledTimes(CALLED_ONCE)
        const expectedVolume = 1
        expect(mockMainRoomSetVolume).toHaveBeenCalledWith(expectedVolume)
      })

      it('should be 1 when volume==50%', async () => {
        const mediumVolume = 50
        newVolume = mediumVolume
        const button = screen.getByTestId('changeVolume')
        await waitFor(() => {
          fireEvent.click(button)
        })
        expect(mockMainRoomSetVolume).toHaveBeenCalledTimes(CALLED_ONCE)
        const expectedVolume = 1
        expect(mockMainRoomSetVolume).toHaveBeenCalledWith(expectedVolume)
      })

      it('should be 0 when volume==100%', async () => {
        const maxVolume = 100
        newVolume = maxVolume
        const button = screen.getByTestId('changeVolume')
        await waitFor(() => {
          fireEvent.click(button)
        })
        expect(mockMainRoomSetVolume).toHaveBeenCalledTimes(CALLED_ONCE)
        const expectedVolume = 0
        expect(mockMainRoomSetVolume).toHaveBeenCalledWith(expectedVolume)
      })
    })

    describe('interpretation volume', () => {
      it('should be 0 when volume==0%', async () => {
        const minVolume = 0
        newVolume = minVolume
        const button = screen.getByTestId('changeVolume')
        await waitFor(() => {
          fireEvent.click(button)
        })
        expect(volumeStub).toHaveBeenCalledTimes(CALLED_ONCE)
        expect(volumeStub).toHaveBeenCalledWith(minVolume)
      })

      it('should be 1 when volume==50%', async () => {
        const mediumVolume = 50
        newVolume = mediumVolume
        const button = screen.getByTestId('changeVolume')
        await waitFor(() => {
          fireEvent.click(button)
        })
        expect(volumeStub).toHaveBeenCalledTimes(CALLED_ONCE)
        const expectedVolume = 1
        expect(volumeStub).toHaveBeenCalledWith(expectedVolume)
      })

      it('should be 1 when volume==100%', async () => {
        const mediumVolume = 50
        newVolume = mediumVolume
        const button = screen.getByTestId('changeVolume')
        await waitFor(() => {
          fireEvent.click(button)
        })
        expect(volumeStub).toHaveBeenCalledTimes(CALLED_ONCE)
        const expectedVolume = 1
        expect(volumeStub).toHaveBeenCalledWith(expectedVolume)
      })
    })
  })

  describe('minimize', () => {
    beforeEach(() => {
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
      await waitFor(() => {
        fireEvent.click(button)
      })
      const minimized = screen.getByTestId('minimized')
      expect(minimized.innerHTML).toBe('true')
    })
  })
})

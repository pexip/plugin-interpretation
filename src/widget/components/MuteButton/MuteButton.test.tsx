import React from 'react'
import { MuteButton } from './MuteButton'
import { fireEvent, render, screen } from '@testing-library/react'

jest.mock('@pexip/components', () => ({
  Button: (props: any) => <button {...props}></button>,
  Icon: (props: any) => <span>{props.source}</span>,
  IconTypes: {
    IconMicrophoneOn: 'mic-on',
    IconMicrophoneOff: 'mic-off'
  }
}))

// eslint-disable-next-line no-var
var mockMuted = false
const mockChangeMute = jest.fn()
jest.mock('../../InterpretationContext/InterpretationContext', () => ({
  useInterpretationContext: () => ({
    changeMute: async (muted: boolean) => mockChangeMute(muted),
    state: {
      muted: mockMuted
    }
  })
}))

describe('MuteButton', () => {
  beforeEach(() => {
    mockChangeMute.mockClear()
  })

  it('should render', () => {
    render(<MuteButton />)
    const button = screen.getByTestId('MuteButton')
    expect(button).toBeInTheDocument()
  })

  it('should set the initial "muted" value when false', () => {
    mockMuted = false
    render(<MuteButton />)
    const button = screen.getByTestId('MuteButton')
    expect(button).not.toHaveClass('muted')
  })

  it('should set the initial "muted" value when true', () => {
    mockMuted = true
    render(<MuteButton />)
    const button = screen.getByTestId('MuteButton')
    expect(button).toHaveClass('muted')
  })

  it('should call "changeMute" when clicked with new value', () => {
    const oldValue = true
    mockMuted = oldValue
    render(<MuteButton />)
    const button = screen.getByTestId('MuteButton')
    fireEvent.click(button)
    expect(mockChangeMute).toHaveBeenCalledTimes(1)
    expect(mockChangeMute).toHaveBeenCalledWith(!oldValue)
  })
})

import React from 'react'
import { Volume } from './Volume'
import { act, fireEvent, render, screen } from '@testing-library/react'

jest.mock('@pexip/components', () => ({
  RangeSlider: (props: { selectedValue: string; onChange: () => void }) => (
    <input
      type="number"
      value={props.selectedValue}
      onChange={props.onChange}
      data-testid="MockSlider"
    />
  )
}))

let mockVolume = 50
const mockChangeVolume = jest.fn()
jest.mock('../../InterpretationContext/InterpretationContext', () => ({
  useInterpretationContext: () => ({
    changeVolume: (volume: number) => {
      mockChangeVolume(volume)
    },
    state: {
      volume: mockVolume
    }
  })
}))

const CALLED_ONCE = 1

describe('Volume', () => {
  beforeEach(() => {
    mockChangeVolume.mockClear()
  })

  it('should render', () => {
    render(<Volume />)
    const volume = screen.getByTestId('Volume')
    expect(volume).toBeInTheDocument()
  })

  describe('slider', () => {
    it('should reflect the current volume', () => {
      render(<Volume />)
      const slider: HTMLInputElement = screen.getByTestId('MockSlider')
      const expectedVolume = 50
      expect(slider.value).toBe(String(expectedVolume))
    })

    it('should call "changeVolume" with the new volume when changed', () => {
      const newValue = 25
      render(<Volume />)
      const slider: HTMLInputElement = screen.getByTestId('MockSlider')
      // eslint-disable-next-line max-nested-callbacks -- max-nested-callbacks
      act(() => {
        fireEvent.change(slider, { target: { value: newValue } })
      })
      expect(mockChangeVolume).toHaveBeenCalledTimes(CALLED_ONCE)
      expect(mockChangeVolume).toHaveBeenCalledWith(newValue)
    })
  })

  describe('footer', () => {
    it('should have the class "MainFloorSelected" if volume < 50', () => {
      const lowVolume = 25
      mockVolume = lowVolume
      render(<Volume />)
      const footer = screen.getByTestId('VolumeFooter')
      expect(footer).toHaveClass('MainFloorSelected')
    })

    it('should have the class "InterpreterSelected" if volume = 50', () => {
      const mediumVolume = 50
      mockVolume = mediumVolume
      render(<Volume />)
      const footer = screen.getByTestId('VolumeFooter')
      expect(footer).toHaveClass('InterpreterSelected')
    })

    it('should have the class "InterpreterSelected" if volume > 50', () => {
      const highVolume = 75
      mockVolume = highVolume
      render(<Volume />)
      const footer = screen.getByTestId('VolumeFooter')
      expect(footer).toHaveClass('InterpreterSelected')
    })
  })
})

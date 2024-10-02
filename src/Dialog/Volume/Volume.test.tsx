import React from 'react'
import { Volume } from './Volume'
import { act, fireEvent, render, screen } from '@testing-library/react'

jest.mock('@pexip/components', () => ({
  RangeSlider: (props: any) => (
    <input
      type='number'
      value={props.selectedValue}
      onChange={props.onChange}
      data-testid='MockSlider'
    />
  )
}))

// eslint-disable-next-line no-var
var mockVolume = 50
const mockChangeVolume = jest.fn()
jest.mock('../../InterpretationContext/InterpretationContext', () => ({
  useInterpretationContext: () => ({
    changeVolume: (volume: number) => mockChangeVolume(volume),
    state: {
      volume: mockVolume
    }
  })
}))

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
      expect(slider.value).toBe(String(50))
    })

    it('should call "changeVolume" with the new volume when changed', () => {
      const newValue = 25
      render(<Volume />)
      const slider: HTMLInputElement = screen.getByTestId('MockSlider')
      act(() => {
        fireEvent.change(slider, { target: { value: newValue } })
      })
      expect(mockChangeVolume).toHaveBeenCalledTimes(1)
      expect(mockChangeVolume).toHaveBeenCalledWith(newValue)
    })
  })

  describe('footer', () => {
    it('should have the class "MainFloorSelected" if volume < 50', () => {
      mockVolume = 25
      render(<Volume />)
      const footer = screen.getByTestId('VolumeFooter')
      expect(footer).toHaveClass('MainFloorSelected')
    })

    it('should have the class "InterpreterSelected" if volume = 50', () => {
      mockVolume = 50
      render(<Volume />)
      const footer = screen.getByTestId('VolumeFooter')
      expect(footer).toHaveClass('InterpreterSelected')
    })

    it('should have the class "InterpreterSelected" if volume > 50', () => {
      mockVolume = 75
      render(<Volume />)
      const footer = screen.getByTestId('VolumeFooter')
      expect(footer).toHaveClass('InterpreterSelected')
    })
  })
})

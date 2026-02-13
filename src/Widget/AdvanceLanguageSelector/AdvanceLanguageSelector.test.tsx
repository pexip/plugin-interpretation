import React from 'react'
import { AdvanceLanguageSelector } from './AdvanceLanguageSelector'
import { fireEvent, render, screen } from '@testing-library/react'
import type { Language } from '../../types/Language'
import { Direction } from '../../types/Direction'

jest.mock('@pexip/components', () => ({
  Select: (props: {
    isDisabled: boolean
    isFullWidth: boolean
    onValueChange: (value: string) => void
  }) => {
    const { isDisabled, isFullWidth, onValueChange, ...otherProps } = props
    return (
      <input
        {...otherProps}
        onChange={(event) => {
          onValueChange(event.target.value)
        }}
      />
    )
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

const CALLED_ONCE = 1

const mockLanguage = spanish
const { InterpretationToMainRoom } = Direction
const mockDirection = InterpretationToMainRoom
const mockChangeLanguage = jest.fn()
const mockChangeDirection = jest.fn()
jest.mock('../../InterpretationContext/InterpretationContext', () => ({
  useInterpretationContext: () => ({
    changeLanguage: (language: Language) => {
      mockChangeLanguage(language)
    },
    changeDirection: (direction: Direction) => {
      mockChangeDirection(direction)
    },
    state: {
      language: mockLanguage,
      direction: mockDirection
    }
  })
}))

jest.mock('../../config', () => ({
  config: {
    languages: [
      {
        code: '0033',
        name: 'french'
      },
      {
        code: '0034',
        name: 'spanish'
      }
    ]
  }
}))

jest.mock('../../user', () => ({
  getUser: () => ({
    rawData: {}
  })
}))

describe('AdvanceLanguageSelector', () => {
  it('should render', () => {
    render(<AdvanceLanguageSelector />)
    const selector = screen.getByTestId('AdvanceLanguageSelector')
    expect(selector).toBeInTheDocument()
  })

  describe('language', () => {
    it('should reflect the current language', () => {
      render(<AdvanceLanguageSelector />)
      const select: HTMLInputElement = screen.getByTestId('LanguageSelect')
      expect(select.value).toBe(spanish.code)
    })

    it('should call "changeLanguage" with the new language', () => {
      render(<AdvanceLanguageSelector />)
      const select: HTMLInputElement = screen.getByTestId('LanguageSelect')
      fireEvent.change(select, { target: { value: french.code } })
      expect(mockChangeLanguage).toHaveBeenCalledTimes(CALLED_ONCE)
      expect(mockChangeLanguage).toHaveBeenCalledWith(french)
    })
  })

  describe('direction', () => {
    it('should reflect the current direction', () => {
      render(<AdvanceLanguageSelector />)
      const selector = screen.getByTestId('AdvanceLanguageSelector')
      expect(selector).toHaveClass('reversed')
    })

    it('should call "changeDirection" with the new direction', () => {
      render(<AdvanceLanguageSelector />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(mockChangeDirection).toHaveBeenCalledTimes(CALLED_ONCE)
      expect(mockChangeDirection).toHaveBeenCalledWith(
        Direction.MainRoomToInterpretation
      )
    })
  })
})

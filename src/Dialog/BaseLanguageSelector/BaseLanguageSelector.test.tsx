import React from 'react'
import { BaseLanguageSelector } from './BaseLanguageSelector'
import { fireEvent, render, screen } from '@testing-library/react'
import type { Language } from '../../types/Language'

jest.mock('@pexip/components', () => ({
  Select: (props: any) => {
    const { isDisabled, isFullWidth, onValueChange, ...otherProps } = props
    return <input {...otherProps} onChange={
      (event) => { onValueChange(event.target.value) }
    }/>
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

// eslint-disable-next-line no-var
var mockLanguage = spanish
const mockChangeLanguage = jest.fn()
jest.mock('../../InterpretationContext/InterpretationContext', () => ({
  useInterpretationContext: () => ({
    changeLanguage: (language: Language) => mockChangeLanguage(language),
    state: {
      language: mockLanguage
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

describe('BaseLanguageSelector', () => {
  it('should render', () => {
    render(<BaseLanguageSelector />)
    const selector = screen.getByTestId('BaseLanguageSelector')
    expect(selector).toBeInTheDocument()
  })

  describe('language', () => {
    it('should reflect the current language', () => {
      render(<BaseLanguageSelector />)
      const selector: HTMLInputElement = screen.getByTestId('BaseLanguageSelector')
      expect(selector.value).toBe(spanish.code)
    })

    it('should call "changeLanguage" with the new language', () => {
      render(<BaseLanguageSelector />)
      const selector: HTMLInputElement = screen.getByTestId('BaseLanguageSelector')
      fireEvent.change(selector, { target: { value: french.code } })
      expect(mockChangeLanguage).toHaveBeenCalledTimes(1)
      expect(mockChangeLanguage).toHaveBeenCalledWith(french)
    })
  })
})

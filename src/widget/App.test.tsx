import React from 'react'
import { render, screen } from '@testing-library/react'
import { App } from './App'

jest.mock('@pexip/plugin-api', () => ({
  registerPlugin: jest.fn()
}))

jest.mock('@pexip/components', () => ({
  ThemeProvider: (props: any) => <div data-testid='App'>{props.children}</div>
}))

jest.mock('./Widget/Widget', () => ({
  Widget: () => <div data-testid='Widget'></div>
}))

jest.mock('./button', () => ({
  initializeButton: jest.fn(),
  refreshContextButton: jest.fn(),
  setButtonActive: jest.fn(async () => { await Promise.resolve() })
}))

jest.mock('./events', () => ({
  initializeEvents: jest.fn(),
  refreshContextEvents: jest.fn()
}))

jest.mock('./config', () => ({
  config: jest.fn()
}))

// eslint-disable-next-line no-var
var mockConnected = false
// eslint-disable-next-line no-var
var mockMinimized = false
jest.mock('./InterpretationContext/InterpretationContext', () => ({
  useInterpretationContext: () => ({
    state: {
      connected: mockConnected,
      minimized: mockMinimized
    }
  })
}))

describe('App', () => {
  it('should render', () => {
    render(<App />)
    const app = screen.getByTestId('App')
    expect(app).toBeInTheDocument()
  })

  it('shouldn\'t display the Widget on load', () => {
    mockConnected = false
    mockMinimized = false
    render(<App />)
    const widget = screen.queryByTestId('Widget')
    expect(widget).not.toBeInTheDocument()
  })

  it('shouldn\'t display the Widget if it\'s connected and minimized', () => {
    mockConnected = true
    mockMinimized = true
    render(<App />)
    const widget = screen.queryByTestId('Widget')
    expect(widget).not.toBeInTheDocument()
  })

  it('shouldn\'t display the Widget if is not connected connected and is minimized', () => {
    mockConnected = false
    mockMinimized = true
    render(<App />)
    const widget = screen.queryByTestId('Widget')
    expect(widget).not.toBeInTheDocument()
  })

  it('should display the Widget once it\'s connected and not minimized', () => {
    mockConnected = true
    mockMinimized = false
    render(<App />)
    const widget = screen.queryByTestId('Widget')
    expect(widget).toBeInTheDocument()
  })
})

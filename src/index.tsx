import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { ThemeProvider } from '@pexip/components'
import { InterpretationContextProvider } from './InterpretationContext/InterpretationContext'

import '@pexip/components/src/fonts.css'
import '@pexip/components/dist/components.css'

import './i18n'

const root = document.getElementById('root')
if (root == null) {
  throw new Error('Not found element with id=root')
}
ReactDOM.createRoot(root).render(
  <ThemeProvider colorScheme="light">
    <InterpretationContextProvider>
      <App />
    </InterpretationContextProvider>
  </ThemeProvider>
)

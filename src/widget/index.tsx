import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { ThemeProvider } from '@pexip/components'
import { InterpretationContextProvider } from './contexts/InterpretationContext/InterpretationContext'

import '@pexip/components/src/fonts.css'
import '@pexip/components/dist/style.css'

const root = document.getElementById('root')
if (root == null) {
  throw new Error('Not found element with id=root')
}
ReactDOM.createRoot(root).render(
  <ThemeProvider colorScheme='light'>
    <InterpretationContextProvider>
      <App />
    </InterpretationContextProvider>
  </ThemeProvider>
)

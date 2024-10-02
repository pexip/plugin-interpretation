import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@pexip/components'
import { Dialog } from './Dialog'
import { type Role } from '../types/Role'

import '@pexip/components/src/fonts.css'
import '@pexip/components/dist/style.css'

const root = document.getElementById('root')
if (root == null) {
  throw new Error('Not found element with id=root')
}

const search = new URLSearchParams(window.location.search)

const role = search.get('role') as Role
if (role == null) {
  throw new Error('role is required')
}

const showListenerMuteButton = search.get('showListenerMuteButton') === 'true'
const allowChangeDirection = search.get('allowChangeDirection') === 'true'

ReactDOM.createRoot(root).render(
  <ThemeProvider colorScheme="light">
    <Dialog
      role={role}
      showListenerMuteButton={showListenerMuteButton}
      allowChangeDirection={allowChangeDirection}
    />
  </ThemeProvider>
)

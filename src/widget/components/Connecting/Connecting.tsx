import React from 'react'
import { Spinner } from '@pexip/components'

import './Connecting.scss'

export const Connecting = (): JSX.Element => {
  return (
    <div className="Connecting">
      <Spinner />
      <span>Connecting...</span>
    </div>
  )
}

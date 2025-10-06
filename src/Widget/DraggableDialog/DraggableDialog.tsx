import React, { useEffect, useRef } from 'react'
import { Box, BoxHeader, Icon, IconTypes, Tooltip } from '@pexip/components'
import { moveIFrame, toggleIFramePointerEvents } from '../../iframe'
import { showDisconnectPrompt } from '../../prompts'
import { useInterpretationContext } from '../../InterpretationContext/InterpretationContext'
import { logger } from '../../logger'

import './DraggableDialog.scss'

interface DraggableDialogProps {
  title: string
  children: React.JSX.Element
}

export const DraggableDialog = (
  props: DraggableDialogProps
): React.JSX.Element => {
  const { minimize } = useInterpretationContext()

  const refDragButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let dragging = false

    const handleMove = (event: MouseEvent): void => {
      if (dragging) {
        moveIFrame(event.pageX, event.pageY)
      }
    }

    if (refDragButton.current != null) {
      refDragButton.current.addEventListener('mousedown', (e) => {
        dragging = true
        toggleIFramePointerEvents(false)
        e.preventDefault()
        parent.document.body.addEventListener(
          'mouseup',
          () => {
            dragging = false
            toggleIFramePointerEvents(true)
          },
          { once: true }
        )
      })
      parent.document.addEventListener('mousemove', handleMove)
    }
    return () => {
      parent.document.removeEventListener('mousemove', handleMove)
    }
  }, [refDragButton])

  return (
    <Box className="DraggableDialog">
      <BoxHeader className="Header">
        <button className="DraggableButton" ref={refDragButton}>
          <Icon source={IconTypes.IconDraggable} />
        </button>

        <span className="Title">{props.title}</span>

        <Tooltip text="Hide dialog" position="bottomLeft">
          <Icon
            className="Minimize"
            source={IconTypes.IconMinus}
            onClick={() => {
              minimize(true)
            }}
          />
        </Tooltip>

        <Tooltip text="Leave interpretation" position="bottomLeft">
          <Icon
            className="Close"
            source={IconTypes.IconClose}
            onClick={() => {
              showDisconnectPrompt().catch(logger.error)
            }}
          />
        </Tooltip>
      </BoxHeader>
      {props.children}
    </Box>
  )
}

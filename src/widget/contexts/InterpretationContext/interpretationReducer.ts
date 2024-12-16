import { Direction } from '../../../types/Direction'
import type { Language } from '../../../types/Language'
import {
  InterpretationActionType,
  type InterpretationAction
} from './InterpretationAction'
import type { InterpretationState } from './InterpretationState'

export const interpretationReducer = (
  prevState: InterpretationState,
  action: InterpretationAction
): InterpretationState => {
  switch (action.type) {
    case InterpretationActionType.Connecting: {
      const language: Language = action.body.language
      return {
        ...prevState,
        connected: false,
        connecting: true,
        language,
        volume: 80,
        direction: Direction.MainRoomToInterpretation
      }
    }
    case InterpretationActionType.Connected: {
      return {
        ...prevState,
        connected: true,
        connecting: false
      }
    }
    case InterpretationActionType.Disconnected: {
      return {
        ...prevState,
        connected: false,
        connecting: false
      }
    }
    case InterpretationActionType.ChangedLanguage: {
      const language: Language = action.body.language
      return {
        ...prevState,
        language
      }
    }
    case InterpretationActionType.ChangedDirection: {
      const direction: Direction = action.body.direction
      return {
        ...prevState,
        direction
      }
    }
    case InterpretationActionType.ChangedMute: {
      const muted: boolean = action.body.muted
      return {
        ...prevState,
        muted
      }
    }
    case InterpretationActionType.ChangedVolume: {
      const volume: number = action.body.volume
      return {
        ...prevState,
        volume
      }
    }
    case InterpretationActionType.Minimize: {
      const minimized: boolean = action.body.minimized
      return {
        ...prevState,
        minimized
      }
    }
    default:
      return prevState
  }
}

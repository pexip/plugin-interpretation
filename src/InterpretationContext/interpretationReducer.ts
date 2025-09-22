import { Direction } from '../types/Direction'
import type { Language } from '../types/Language'
import {
  InterpretationActionType,
  type InterpretationAction
} from './InterpretationAction'
import type { InterpretationState } from './InterpretationState'

export const interpretationReducer = (
  prevState: InterpretationState,
  action: InterpretationAction
): InterpretationState => {
  const { type, body } = action
  switch (type) {
    case InterpretationActionType.Connecting: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-argument
      const { language } = body as { language: Language }
      const defaultVolume = 80
      return {
        ...prevState,
        connected: false,
        language,
        volume: defaultVolume,
        direction: Direction.MainRoomToInterpretation
      }
    }
    case InterpretationActionType.Connected: {
      return {
        ...prevState,
        connected: true
      }
    }
    case InterpretationActionType.Disconnected: {
      return {
        ...prevState,
        connected: false
      }
    }
    case InterpretationActionType.ChangedLanguage: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-argument
      const { language } = body as { language: Language }
      return {
        ...prevState,
        language
      }
    }
    case InterpretationActionType.ChangedDirection: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-argument
      const { direction } = body as { direction: Direction }
      return {
        ...prevState,
        direction
      }
    }
    case InterpretationActionType.ChangedMute: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-argument
      const { muted } = body as { muted: boolean }
      return {
        ...prevState,
        muted
      }
    }
    case InterpretationActionType.ChangedVolume: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-argument
      const { volume } = body as { volume: number }
      return {
        ...prevState,
        volume
      }
    }
    case InterpretationActionType.Minimize: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- no-unsafe-argument
      const { minimized } = body as { minimized: boolean }
      return {
        ...prevState,
        minimized
      }
    }
    default:
      return prevState
  }
}

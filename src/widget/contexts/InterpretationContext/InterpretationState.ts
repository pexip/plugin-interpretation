import type { Direction } from '../../../types/Direction'
import type { Language } from '../../../types/Language'
import type { Role } from '../../../types/Role'

interface InterpretationState {
  role: Role
  connected: boolean
  connecting: boolean
  language: Language | null
  direction: Direction
  muted: boolean
  volume: number
  minimized: boolean
}

export type { InterpretationState }

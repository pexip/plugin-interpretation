import type { InterpretationContextType } from './InterpretationContext/InterpretationContext'

let context: InterpretationContextType

export const setInterpretationContext = (interpretationContext: InterpretationContextType): void => {
  context = interpretationContext
}

export const getInterpretationContext = (): InterpretationContextType => {
  return context
}

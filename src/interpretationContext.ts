import type { InterpretationContextType } from './InterpretationContext/InterpretationContext'

let context: InterpretationContextType | null = null

export const setInterpretationContext = (
  interpretationContext: InterpretationContextType
): void => {
  context = interpretationContext
}

export const getInterpretationContext = (): InterpretationContextType => {
  if (context == null) {
    throw new Error('Interpretation context not set')
  }
  return context
}

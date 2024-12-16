enum InterpretationActionType {
  Connecting,
  Connected,
  Disconnected,
  ChangedPin,
  ChangedLanguage,
  ChangedDirection,
  ChangedMute,
  ChangedVolume,
  Minimize
}

interface InterpretationAction {
  type: InterpretationActionType
  body?: any
}

export { InterpretationActionType }
export type { InterpretationAction }

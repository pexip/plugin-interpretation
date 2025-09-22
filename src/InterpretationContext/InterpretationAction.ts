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
  body?: unknown
}

export { InterpretationActionType }
export type { InterpretationAction }

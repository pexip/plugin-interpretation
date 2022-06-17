export interface Config {
  isInterpreter: boolean;
  listenerVolume: number;
  startAudioMuted: boolean;
  startVideoMuted: boolean;
  reuseListenerPin: boolean;
  roleIndicator: boolean;
  subRoomMonitor: boolean;
  languages: Array<[string, string]>;
}

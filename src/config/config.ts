export interface Config {
  isInterpreter: boolean;
  listenerVolume: number;
  startAudioMuted: boolean;
  startVideoMuted: boolean;
  reuseListenerPin: boolean;
  showRoleIndicator: boolean;
  languages: Array<[string, string]>;
}

export interface Config {
  isInterpreter: boolean;
  listenerVolume: number;
  startAudioMuted: boolean;
  startVideoMuted: boolean;
  reuseListenerPin: boolean;
  languages: Array<[string, string]>;
}

export interface Config {
  isInterpreter: boolean;
  listenerVolume: number;
  startAudioMuted: boolean;
  startVideoMuted: boolean;
  reuseListenerPin: boolean;
  roleIndicator: boolean;
  monitorSubRooms: {
    enabled: boolean;
    rescanInterval: number;
    guestPin: string;
  }
  languages: Array<[string, string]>;
}

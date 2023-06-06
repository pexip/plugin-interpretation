export enum Role {
  INTERPRETER = "interpreter",
  LISTENER = "listener",
  MODERATOR = "moderator",
  AUTO = "auto"
}

export interface Config {
  role: Role;
  languages: Array<[string, string]>;
  listenerVolume: number;
  startAudioMuted: boolean;
  startVideoMuted: boolean;
  reuseListenerPin: boolean;
  roleIndicator: boolean;
  interpreterCanToggleRoom: boolean;
  filterActiveLanguages: {
    enabled: boolean;
    simultaneousScans: number;
  };
  monitorSubRooms: {
    rescanInterval: number;
    guestPin: string;
    simultaneousScans: number;
  };
}

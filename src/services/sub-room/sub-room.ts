import { OptionType } from "../../typings";
import { DialogService } from "../dialog/dialog";

export class SubRoomService {

  private audio: HTMLAudioElement;

  private pexRtcMainRoom: any;
  private pexRtcSubRoom: any;

  private currentLanguage: OptionType;
  private connectCallback: Function;
  private disconnectCallback: Function;

  private reuseListenerPin: boolean;

  constructor(
    private isInterpreter: boolean,
    private dialogService: DialogService
  ) {
    this.pexRtcMainRoom = (window as any).PEX.pexrtc;
  }

  connect(language: OptionType, connectCallback: Function, disconnectCallback: Function, reuseListenerPin: boolean = false) {
    this.currentLanguage = language;
    this.connectCallback = connectCallback;
    this.disconnectCallback = disconnectCallback;
    this.reuseListenerPin = reuseListenerPin
    //@ts-ignore
    this.pexRtcSubRoom = new PexRTC();
    this.pexRtcSubRoom.onSetup = this.onSetup.bind(this);
    this.pexRtcSubRoom.onConnect = this.onConnect.bind(this);
    this.pexRtcSubRoom.onError = this.onDisconnect.bind(this);
    this.pexRtcSubRoom.onDisconnect = this.onDisconnect.bind(this);
    window.addEventListener('beforeunload', this.disconnect.bind(this));
    if (!this.isInterpreter) {
      this.pexRtcSubRoom.audio_source = false;
    }
    this.pexRtcSubRoom.video_source = false;
    this.pexRtcSubRoom.recv_video = false;
    this.pexRtcSubRoom.makeCall(
      this.pexRtcMainRoom.node,
      this.pexRtcMainRoom.conference + language.value,
      this.pexRtcMainRoom.display_name,
      undefined,
      this.isInterpreter ? "audioonly" : "recvonly"
    );
  }

  disconnect() {
    if (this.isConnected()) {
      this.pexRtcSubRoom.disconnect();
      this.disconnectCallback();
    }
  }

  isConnected() {
    return this.pexRtcSubRoom?.state === 'ACTIVE';
  }

  private onConnect(remoteStream: MediaStream) {
    if (!this.isInterpreter) this.pexRtcSubRoom.muteAudio(true);
    this.audio = new Audio();
    this.audio.srcObject = remoteStream;
    this.audio.play();
    this.connectCallback();
  }

  private onSetup(localStream: MediaStream, pinStatus: string, conferenceExtension: string) {
    if (pinStatus == 'required' && !this.isInterpreter && this.reuseListenerPin) {
      this.pexRtcSubRoom.connect(this.pexRtcMainRoom.pin);
      return;
    }
    if (pinStatus == 'required' || (pinStatus == 'optional' && this.isInterpreter)) {
      const pinRequired = true;
      this.dialogService.show({
        title: 'PIN required',
        cancelText: 'Cancel',
        cancelCallback: () => this.disconnect(),
        acceptText: 'Confirm',
        acceptCallback: (pin: string) => {this.pexRtcSubRoom.connect(pin)},
        pinRequired: pinRequired
      });
    } else {
      this.pexRtcSubRoom.connect();
    }
  }

  private onDisconnect(reason: string) {
    switch(reason) {
      case "All conference hosts departed hosted conference":
        this.dialogService.show({
          title: 'Interpretation finished',
          content: `The interpretation for ${this.currentLanguage.label} finished.`,
          cancelText: 'Close'
        });
        break;
      default:
        this.dialogService.show({
          title: 'Error detected',
          content: reason,
          cancelText: 'Close'
        });
        break;
    }
    this.disconnectCallback();
  }

}
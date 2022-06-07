import { DialogService } from "../dialog/dialog";

export class SubRoomService {

  private audio: HTMLAudioElement;

  private pexRtcMainRoom: any;
  private pexRtcSubRoom: any;

  private connectCallback: Function;
  private disconnectCallback: Function;

  constructor(
    private isInterpreter: boolean,
    private dialogService: DialogService
  ) {
    this.pexRtcMainRoom = (window as any).PEX.pexrtc;
  }

  connect(languageCode: string, connectCallback: Function, disconnectCallback: Function) {
    this.connectCallback = connectCallback;
    this.disconnectCallback = disconnectCallback;
    //@ts-ignore
    this.pexRtcSubRoom = new PexRTC();
    this.pexRtcSubRoom.onSetup = this.onSetup.bind(this);
    this.pexRtcSubRoom.onConnect = this.onConnect.bind(this);
    this.pexRtcSubRoom.onError = this.onError.bind(this);
    this.pexRtcSubRoom.onDisconnect = this.onDisconnect.bind(this);
    window.addEventListener('beforeunload', this.disconnect.bind(this));
    this.pexRtcSubRoom.makeCall(
      this.pexRtcMainRoom.node,
      this.pexRtcMainRoom.conference + languageCode,
      this.pexRtcMainRoom.display_name,
      undefined,
      this.isInterpreter ? "audioonly" : "recvonly"
    );
  }

  disconnect() {
    this.pexRtcSubRoom.disconnect();
    this.disconnectCallback();
  }

  isConnected() {
    return this.pexRtcSubRoom?.state === 'ACTIVE';
  }

  private onConnect(remoteStream: MediaStream) {
    this.audio = new Audio();
    this.audio.srcObject = remoteStream;
    this.audio.play();
    this.connectCallback();
  }

  private onSetup(localStream: MediaStream, pinStatus: string, conferenceExtension: string) {
    if (pinStatus == 'required' || (pinStatus == 'optional' && this.isInterpreter)) {
      const pinRequired = true;
      this.dialogService.show({
        title: 'PIN required',
        content: '',
        cancelText: 'Cancel',
        cancelCallback: () => this.disconnect(),
        acceptText: 'Confirm',
        acceptCallback: (pin: string) => {this.pexRtcSubRoom.connect(pin)},
        selectValues: undefined,
        pinRequired: pinRequired
      });
    } else {
      this.pexRtcSubRoom.connect();
    }
  }

  private onError(error: string) {
    this.dialogService.show({
      title: 'Error found',
      content: `An error was detected: ${error}`,
      cancelText: 'Close'
    });
  }

  private onDisconnect(reason: string) {
    this.dialogService.show({
      title: 'Error found',
      content: `An error was detected: ${reason}`,
      cancelText: 'Close'
    });
    this.disconnectCallback();
  }

}
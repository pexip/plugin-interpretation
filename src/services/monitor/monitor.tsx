interface InfoSubRoom {
  language: [string, string];
  participants: any[];
}

export class MonitorService {

  private infoSubRooms: InfoSubRoom[] = [];

  private timeout: NodeJS.Timeout;
  private readonly timeoutScanning = 1000;
  private readonly timeBetweenScanning = 15000;

  constructor(private languages: Array<[string, string]>) {}

  connect() {
    // Populate the array with all the languages and empty participants
    this.infoSubRooms = this.languages.map( (language) => {
      return {
        language: language,
        participants: []
      }
    });
    (window as any).infoSubRooms = this.infoSubRooms;
    this.scanning(0);
  }

  disconnect() {
    clearTimeout(this.timeout);
  }

  private scanning(languageIndex: number) {
    this.timeout = setTimeout( () => {
      this.checkSubRoom(this.infoSubRooms[languageIndex]);
      if (languageIndex < this.infoSubRooms.length - 1) {
        this.scanning(++languageIndex);
        console.log(this.infoSubRooms);
      } else {
        const nextScanningTimeout = this.timeBetweenScanning  - this.infoSubRooms.length * this.timeoutScanning
        this.timeout = setTimeout( () => this.scanning(0), nextScanningTimeout);
      }
    }, this.timeoutScanning);
  }

  private checkSubRoom(infoSubRoom: InfoSubRoom) {
    const pexRtcMainRoom = (window as any).PEX.pexrtc;
    // @ts-ignore
    const pexrtc = new PexRTC();
    const disconnect = () => pexrtc.disconnect();
    pexrtc.onConnect = () => {
      window.addEventListener('beforeunload', disconnect);
    };
    pexrtc.onConferenceUpdate = (properties: any) => {
      // Conference empty
      if (properties.started === false) {
        window.removeEventListener('beforeunload', disconnect);
        pexrtc.disconnect();
      }
    }
    pexrtc.onSetup = (localStream: MediaStream, pinStatus: string, conferenceExtension: string) => {
      var pin = '';
      if (pinStatus === 'required' || pinStatus === 'optional') {
        pin = '4321';
      }
      pexrtc.connect(pin);
    }
    pexrtc.onParticipantCreate = (participant: any) => {
      if (participant.has_media) {
        const index = infoSubRoom.participants.findIndex( (part) => part.uuid === participant.uuid);
        if (index < 0) {
          infoSubRoom.participants.push(participant);
        } else {
          infoSubRoom.participants[index] = participant;
        }
      }
    };
    pexrtc.onParticipantUpdate = () => {
      // All the users retrieved
      window.removeEventListener('beforeunload', disconnect);
      pexrtc.disconnect();
    };
    pexrtc.makeCall(
      pexRtcMainRoom.node,
      pexRtcMainRoom.conference + infoSubRoom.language[0],
      pexRtcMainRoom.display_name,
      undefined,
      'none'
    );
  }

  // private setMonitorPanel() {

  //   const sidebarContainer = document.getElementsByClassName('pex-sidebar-container');

  //   if (sidebarContainer) {
  //     const indicators = userContainer.querySelector('ul');
  //     let indicatorContainer = indicators.querySelector('.plugin-interpretation-interpreter-indicator');
  //     if (!indicatorContainer) {
  //       indicatorContainer = document.createElement('li');
  //       indicatorContainer.className = 'plugin-interpretation-interpreter-indicator';
  //       indicators.appendChild(indicatorContainer);
  //       const root = ReactDOM.createRoot(indicatorContainer);
  //       const isInterpreter = role === Role.INTERPRETER
  //       root.render(<RoleIndicator isInterpreter={isInterpreter}/>);
  //     }
  //   }
    
  // }

}
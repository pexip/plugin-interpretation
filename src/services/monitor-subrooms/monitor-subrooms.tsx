import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';

import { MonitorSubRooms } from "./MonitorSubRooms/MonitorSubRooms";

export interface InfoSubRoom {
  language: [string, string];
  participants: any[];
}

export class MonitorSubRoomsService {

  private infoSubRooms: InfoSubRoom[] = [];

  private root: ReactDOM.Root;

  private loadingPercentage$ = new BehaviorSubject<number>(0);

  private interval: NodeJS.Timeout;

  constructor(
    private languages: Array<[string, string]>,
    private rescanInterval: number,
    private guestPin: string,
    private simultaneousScans: number
  ) {}

  init() {
    // Populate the array with all the languages and empty participants
    this.infoSubRooms = this.languages.map( (language) => {
      return {
        language: language,
        participants: []
      }
    });
    (window as any).infoSubRooms = this.infoSubRooms;
    this.setMonitorPanel();
  }

  startScanning() {
    this.interval = setInterval( () => {
      this.scan();
    }, this.rescanInterval);
    this.scan();
  }

  stopScanning() {
    clearInterval(this.interval);
    this.interval = null;
  }

  private async scan() {
    let roomsScanned = 1;
    for (let i = 0; i < this.infoSubRooms.length; i += this.simultaneousScans) {
      let maxScans = this.simultaneousScans;
      // Check if it's the last one
      if (this.languages.length - i < this.simultaneousScans) {
        maxScans = this.languages.length % this.simultaneousScans;
      }
      const promises: Promise<void>[] = [];
      for (let j = 0; j < maxScans; j++) {
        const index = i + j;
        const promise = this.checkSubRoom(this.infoSubRooms[index])
          .then(() => {
            this.loadingPercentage$.next( ++roomsScanned / this.infoSubRooms.length * 100);
            return Promise.resolve();
          })
          .catch( (error) => {
            console.error(`Cannot monitor room for ${this.infoSubRooms[index].language[1]}. ${error}`);
        });
        promises.push(promise);
      }
      await Promise.all(promises);
      if (!this.interval) {
        this.loadingPercentage$.next(0);
        return;
      }
    }
    this.loadingPercentage$.next(0);
  }
  
  private checkSubRoom(infoSubRoom: InfoSubRoom) {
    return new Promise<void>( (resolve, reject) => {
      const pexRtcMainRoom = (window as any).PEX.pexrtc;
      // @ts-ignore
      const pexrtc = new PexRTC();
      pexrtc.call_tag = 'interpreter-monitor-subrooms';
      const disconnect = () => pexrtc.disconnect();
      pexrtc.onError = (error: Error) => { reject(error) };
      pexrtc.onConnect = () => {
        window.addEventListener('beforeunload', disconnect);
      };
      pexrtc.onConferenceUpdate = (properties: any) => {
        // Conference empty
        if (properties.started === false) {
          window.removeEventListener('beforeunload', disconnect);
          pexrtc.disconnect();
          resolve();
        }
      }
      pexrtc.onSetup = (localStream: MediaStream, pinStatus: string, conferenceExtension: string) => {
        var pin = '';
        if (pinStatus === 'required' || pinStatus === 'optional') {
          pin = this.guestPin;
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
        this.setMonitorPanel();
        resolve();
      };
      pexrtc.makeCall(
        pexRtcMainRoom.node,
        pexRtcMainRoom.conference + infoSubRoom.language[0],
        pexRtcMainRoom.display_name,
        undefined,
        'none'
      );
    });
  }

  private setMonitorPanel() {
    if (!this.root) {
      const sidebarContainer = document.getElementById('pex-sidebar-container');
      if (sidebarContainer) {
        const monitorPanel = document.createElement('div');
        monitorPanel.id = 'plugin-interpretation-monitor';
        sidebarContainer.appendChild(monitorPanel);
        this.root = ReactDOM.createRoot(monitorPanel);
      }
    }
    if (this.root) this.root.render(
      <MonitorSubRooms infoSubRooms={this.infoSubRooms} onOpen={this.startScanning.bind(this)} onClose={this.stopScanning.bind(this)} loadingPercentage$={this.loadingPercentage$}/>
    );
  }

}
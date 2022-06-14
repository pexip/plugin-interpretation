import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { InterpreterIndicator } from './InterpreterIndicator/InterpreterIndicator';

interface ParticipantStatus {
  uuid: string;
  startTime: number;
  displayName: string;
  isInterpreter: boolean;
}

export class InterpreterIndicatorService {

  private readonly interpreterCharacter = '\u2002'; // En Space

  private participants: ParticipantStatus[] = [];

  constructor(isInterpreter: boolean) {
    console.error(this.participants);
    const pexrtc = (window as any).PEX.pexrtc;
    const displayName = pexrtc.display_name;
    if (isInterpreter) {
      pexrtc.setParticipantText(pexrtc.uuid, displayName + this.interpreterCharacter );
    }
    const originalOnParticipantCreate = pexrtc.onParticipantCreate;
    const originalOnParticipantUpdate = pexrtc.onParticipantUpdate;
    const originalOnParticipantDelete = pexrtc.onParticipantDelete;
    pexrtc.onParticipantCreate = (participant: any) => {
      console.error(participant);
      originalOnParticipantCreate(participant);
      console.error('onParticipantCreate ' + participant.display_name);
      this.onParticipantUpdate(participant);
      
    };
    pexrtc.onParticipantUpdate = (participant: any) => {
      console.error(participant);
      console.error('onParticipantUpdate ' + participant.display_name);
      originalOnParticipantUpdate(participant);
      this.onParticipantUpdate(participant);
     
    };
    pexrtc.onParticipantDelete = (payload: any) => {
      originalOnParticipantDelete(payload);
      this.onParticipantDelete(payload);
    };
  }

  private onParticipantUpdate(participant: any) {
 
    const isInterpreter = participant.overlay_text.match(new RegExp(this.interpreterCharacter));

    let index = this.participants.findIndex( (part) => part.uuid === participant.uuid);

    if (index < 0) {
      const participantStatus: ParticipantStatus = {
        uuid: participant.uuid,
        startTime: participant.start_time,
        displayName: participant.display_name,
        isInterpreter: isInterpreter
      }
      this.participants.push(participantStatus);
      console.log(this.participants.length);
      index = this.participants.length - 1;
    }
    this.participants.sort( (a, b) =>  a.startTime - b.startTime);
    console.error(this.participants);
    this.participants.forEach( (participant) => {
      if (participant.isInterpreter) {
        this.setInterpreterIndicator(participant.uuid);
      }
    });
  };

  private onParticipantDelete(payload: any) {
    const index = this.participants.findIndex( (participant) => participant.uuid === payload.uuid );
    if (index) {
      this.participants.splice(index, 1);
    }
  }

  private setInterpreterIndicator(uuid: string) {

    const index = this.participants.findIndex( (participant) => participant.uuid === uuid );

    const userContainer = document.getElementsByClassName('pex-roster-list__user')[index];

    if (userContainer) {
      const indicators = userContainer.querySelector('ul');
      let indicatorContainer = indicators.querySelector('.plugin-interpretation-interpreter-indicator');
      if (!indicatorContainer) {
        indicatorContainer = document.createElement('li');
        indicatorContainer.className = 'plugin-interpretation-interpreter-indicator';
        indicators.appendChild(indicatorContainer);
        const root = ReactDOM.createRoot(indicatorContainer);
        root.render(<InterpreterIndicator />);
      }
    }
    
  }

}
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Role } from '../../config/config';
import { RoleIndicator } from './RoleIndicator/RoleIndicator';

interface ParticipantStatus {
  uuid: string;
  startTime: number;
  displayName: string;
  role: Role;
}

export class RoleIndicatorService {

  private participants: ParticipantStatus[];

  constructor() {  }

  init() {
    this.participants = [];
    const pexrtc = (window as any).PEX.pexrtc;
    const originalOnParticipantCreate = pexrtc.onParticipantCreate;
    const originalOnParticipantUpdate = pexrtc.onParticipantUpdate;
    const originalOnParticipantDelete = pexrtc.onParticipantDelete;
    pexrtc.onParticipantCreate = (participant: any) => {
      originalOnParticipantCreate(participant);
      this.onParticipantUpdate(participant);
    };
    pexrtc.onParticipantUpdate = (participant: any) => {
      originalOnParticipantUpdate(participant);
      this.onParticipantUpdate(participant);
    };
    pexrtc.onParticipantDelete = (payload: any) => {
      originalOnParticipantDelete(payload);
      this.onParticipantDelete(payload);
    };
  }

  private onParticipantUpdate(participant: any) {
 
    let role;

    if (participant.call_tag === 'interpreter') {
      role = Role.INTERPRETER;
    } else if (participant.call_tag === 'listener') {
      role = Role.LISTENER;
    }

    const found = this.participants.find( (part) => part.uuid === participant.uuid);

    if (!found) {
      const participantStatus: ParticipantStatus = {
        uuid: participant.uuid,
        startTime: participant.start_time,
        displayName: participant.display_name,
        role: role
      }
      this.participants.push(participantStatus);
    }
    this.participants.sort( (a, b) =>  a.startTime - b.startTime);
    this.participants.forEach( (participant) => {
      if (participant.role) {
        this.setRoleIndicator(participant.uuid, participant.role);
      }
    });
  };

  private onParticipantDelete(payload: any) {
    const index = this.participants.findIndex( (participant) => participant.uuid === payload.uuid );
    if (index) {
      this.participants.splice(index, 1);
    }
  }

  private setRoleIndicator(uuid: string, role: Role) {

    const index = this.participants.findIndex( (participant) => participant.uuid === uuid );

    const userContainer = document.getElementsByClassName('pex-roster-list__user')[index];

    if (userContainer) {
      const indicators = userContainer.querySelector('ul');
      let indicatorContainer = indicators.querySelector('.plugin-interpretation-interpreter-indicator');
      if (!indicatorContainer) {
        indicatorContainer = document.createElement('li');
        indicatorContainer.className = 'plugin-interpretation-interpreter-indicator';
        indicators.appendChild(indicatorContainer);
      }
      const root = ReactDOM.createRoot(indicatorContainer);
      root.render(<RoleIndicator role={role} />);
    }
  }

}
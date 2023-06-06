import * as React from 'react';

import StatusPanel from './StatusPanel/StatusPanel';

import * as ReactDOM from 'react-dom/client';
import { RoomType } from '../../typings';

export class StatusPanelService {

  private root: ReactDOM.Root;

  constructor(
    private isInterpreter: boolean,
    private interpreterCanToggleRoom: boolean,
    private handleChangeInterpreterSpeakRoom: (room: RoomType) => void
  ) {}

  show(language: string, connected: boolean) {
    if (this.root) this.root.unmount();
    let statusContainer = document.getElementById('plugin-interpretation-status-panel');
    if (!statusContainer) {
      statusContainer = document.createElement('div');
      statusContainer.id = 'plugin-interpretation-status-panel';
      const conferenceContainer = document.getElementById('conference-stage-container');
      conferenceContainer.appendChild(statusContainer);
    }
    this.root = ReactDOM.createRoot(statusContainer);
    this.root.render(<StatusPanel
        isInterpreter={this.isInterpreter}
        language={language}
        connected={connected}
        interpreterCanToggleRoom={this.interpreterCanToggleRoom}
        onSpeakerRoomChange={this.handleChangeInterpreterSpeakRoom}
      />
    );
  }

  hide() {
    this.root?.unmount();
  }

}
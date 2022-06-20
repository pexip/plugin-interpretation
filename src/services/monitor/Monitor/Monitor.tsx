import * as React from "react";
import { Component } from "react";
import { Table } from "react-bootstrap";

import { InfoSubRoom } from "../monitor";

import './Monitor.scss';

interface Participant {
  displayName: string;
  isInterpreter: boolean;
  language: string;
}

interface IState {
  showPanel: boolean;
}

interface IProps {
  infoSubRooms: InfoSubRoom[]
}

export class Monitor extends Component<IProps> {

  state: IState = {
    showPanel: false
  }
  
  render() {
    let participants: Participant[] = [];
    this.props.infoSubRooms.filter( (info) => info.participants.length).forEach( (info) => {
      return info.participants.forEach( (participant) => {
        participants.push({
          displayName: participant.display_name,
          isInterpreter: participant.role === 'chair',
          language: info.language[1]
        });
      });
    });
    const participantsRows = participants.map( (participant) => (
      <tr>
        <td>{participant.displayName}</td>
        <td>{participant.language}</td>
      </tr>
    ));
    return (
      <div className={ this.state.showPanel ? 'Monitor selected' : 'Monitor'}>
        <button className='header' onClick={this.togglePanel.bind(this)}>
          <svg>
            <use href='icons.svg#chevron-right'/>
          </svg>
          Language rooms
        </button>
        { this.state.showPanel &&
            <div className="content">
              { participants.length 
                ?
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>Participants</th>
                        <th>Language</th>
                      </tr>
                    </thead>
                    <tbody>
                      { participantsRows }
                    </tbody>
                  </Table>
                :
                  <div className="no-content">No users in language rooms</div>
              }
            </div>
        }
      </div>
    );
  }

  private togglePanel() {
    this.state.showPanel = !this.state.showPanel;
    this.setState(this.state);
  }

}
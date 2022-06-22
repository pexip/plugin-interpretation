import * as React from "react";
import { Component } from "react";
import { BehaviorSubject, Subscription } from "rxjs";

import { InfoSubRoom } from "../monitor-subrooms";

import './MonitorSubRooms.scss';

interface Participant {
  displayName: string;
  isInterpreter: boolean;
  language: string;
}

interface IState {
  showPanel: boolean;
  loadingPercentage: number;
}

interface IProps {
  infoSubRooms: InfoSubRoom[];
  loadingPercentage$: BehaviorSubject<number>;
  onOpen: Function;
  onClose: Function;
}

export class MonitorSubRooms extends Component<IProps> {

  private loadingPercentageSubscription: Subscription;

  state: IState = {
    showPanel: false,
    loadingPercentage: 0
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
        <td>
            <svg>
              <use href={
                  participant.isInterpreter
                  ? 'custom_configuration/plugins/interpretation/assets/images/interpreter.svg#off'
                  : 'custom_configuration/plugins/interpretation/assets/images/listener.svg#off'
                } />
            </svg>
            <div className='tooltip'>{participant.isInterpreter ? 'Interpreter' : 'Participant'}</div>
        </td>
        <td>{participant.displayName}</td>
        <td>{participant.language}</td>
      </tr>
    ));
    
    return (
      <div className={ this.state.showPanel ? 'MonitorSubRooms selected' : 'MonitorSubRooms'}>
        <button className='header' onClick={this.togglePanel.bind(this)}>
          <svg>
            <use href='icons.svg#chevron-right'/>
          </svg>
          Interpretation users
        </button>
        { this.state.showPanel &&
            <div className="content">
              <div className="loading" style={{width: (this.state.loadingPercentage + '%'), opacity: this.state.loadingPercentage ? 1 : 0}}></div>
              { participants.length 
                ?
                  <table>
                    { participantsRows }
                  </table>
                :
                  <div className="no-content">No users in interpretation rooms</div>
              }
            </div>
        }
      </div>
    );
  }

  componentDidMount(): void {
    this.loadingPercentageSubscription = this.props.loadingPercentage$.subscribe( (percentage) => {
      this.state.loadingPercentage = percentage;
      this.setState(this.state);
    });
  }

  componentWillUnmount(): void {
    this.loadingPercentageSubscription.unsubscribe();
  }

  private togglePanel() {
    this.state.showPanel = !this.state.showPanel;
    this.setState(this.state);
    if (this.state.showPanel) {
      this.props.onOpen();
    } else {
      this.props.onClose();
    }
  }
}
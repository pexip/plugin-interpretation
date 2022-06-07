import * as React from "react";
import { Component } from "react";

import './StatusPanel.scss';

interface IProps {
  isInterpreter: boolean;
  language: string;
  connected: boolean;
}

export class StatusPanel extends Component<IProps> {

  render() {
    const interpreterIcon = "custom_configuration/plugins/interpretation/assets/images/interpreter.svg#on";
    const listenerIcon = "custom_configuration/plugins/interpretation/assets/images/listener.svg#on";
    return (
      <div className="StatusPanel">
        { this.props.connected
          ? <svg className="icon">
              <use href={this.props.isInterpreter ? interpreterIcon : listenerIcon}/>
            </svg>
          : <div className="loading-spinner"></div>
        }
        {this.props.language}
      </div>
    );
  }
  
}
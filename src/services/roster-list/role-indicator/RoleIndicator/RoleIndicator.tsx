import * as React from 'react';
import { Component } from "react";

import './RoleIndicator.scss';

interface IProps {
  isInterpreter: boolean;
}

export class RoleIndicator extends Component<IProps> {
 render() {
  const interpreterIcon = "custom_configuration/plugins/interpretation/assets/images/interpreter.svg#off";
  const listenerIcon = "custom_configuration/plugins/interpretation/assets/images/listener.svg#off";
  return (
    <div className='RoleIndicator'>
      <svg>
        <use href={this.props.isInterpreter ? interpreterIcon : listenerIcon}/>
      </svg>
      <div className='tooltip'>{this.props.isInterpreter ? 'Interpreter' : 'Participant'}</div>
    </div>
  );
 }
}


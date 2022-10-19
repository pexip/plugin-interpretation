import * as React from 'react';
import { Component } from "react";

import { Role } from '../../../config/config';

import './RoleIndicator.scss';

interface IProps {
  role: Role;
}

export class RoleIndicator extends Component<IProps> {
 render() {
  const interpreterIcon = "custom_configuration/plugins/interpretation/assets/images/interpreter.svg#off";
  const listenerIcon = "custom_configuration/plugins/interpretation/assets/images/listener.svg#off";
  return (
    <div className='RoleIndicator'>
      <svg>
        <use href={this.props.role === Role.INTERPRETER ? interpreterIcon : listenerIcon}/>
      </svg>
      <div className='tooltip'>{this.props.role === Role.INTERPRETER ? 'Interpreter' : 'Participant'}</div>
    </div>
  );
 }
}


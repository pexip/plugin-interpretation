import * as React from 'react';
import { Component } from "react";

import './InterpreterIndicator.scss';

export class InterpreterIndicator extends Component {
 render() {
  return (
    <svg>
      <use href='custom_configuration/plugins/interpretation/assets/images/interpreter.svg#off'/>
    </svg>
  );
 }
}
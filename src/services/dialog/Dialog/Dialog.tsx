import * as React from "react";
import { Component } from "react";
import Select from "react-select";
import { OptionType } from "../../../typings";

import './Dialog.scss';

interface IProps {
  title: string;
  content: string;
  cancelText: string;
  cancelCallback: Function;
  acceptText?: string;
  acceptCallback?: Function;
  selectValues?: OptionType[];
  pinRequired?: boolean;
}

interface IState {
  selectValue: OptionType;
  pin: number
}

export class Dialog extends Component<IProps> {

  state: IState = {
    selectValue: null,
    pin: null
  }

  render() {
    return (
      <div className="Dialog" onClick={() => this.props.cancelCallback()}>
        <div className="container" onClick={(event) => event.stopPropagation()}>
          <button className="close" onClick={() => this.props.cancelCallback()}>
            <svg>
              <use href="icons.svg#x" />
            </svg>
          </button>
          <span className="title">{this.props.title}</span>
          { this.props.content && 
            <div className="content">
              {this.props.content}
            </div>
          }
          { this.props.selectValues && <Select className="select" options={this.props.selectValues} onChange={this.selectChange.bind(this)} /> }
          { this.props.pinRequired &&
              <input type="password" placeholder="Enter your PIN here" onChange={this.pinChange.bind(this)}
                onKeyDown={(event: React.KeyboardEvent) => {
                  if (event.key === 'Enter') this.props.acceptCallback(this.state.pin);
                }}
              />
          }
          <div className="buttons">
            { this.props.acceptText && <button className="accept"
              disabled={this.props.selectValues && !this.state.selectValue}
              onClick={() => {
                this.props.acceptCallback(this.state.selectValue ? this.state.selectValue : this.state.pin);
              }}>{this.props.acceptText}</button> } 
            <button className="cancel" onClick={() => this.props.cancelCallback()}>{this.props.cancelText}</button>
          </div>
        </div>
      </div>
    );
  }

  private selectChange(value: any) {
    this.state.selectValue = value;
    this.setState(this.state);
  }

  private pinChange(value: any) {
    this.state.pin = value.currentTarget.value;
    this.setState(this.state);
  }

}
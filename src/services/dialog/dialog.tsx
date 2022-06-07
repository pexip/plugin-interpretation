import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import { Dialog } from './Dialog/Dialog';
import { OptionType } from '../../typings';

interface DialogOptions {
  title: string,
  content: string;
  cancelText?: string;
  cancelCallback?: Function;
  acceptText?: string;
  acceptCallback?: Function;
  selectValues?: OptionType[];
  pinRequired?: boolean;
}

export class DialogService {

  private root: ReactDOM.Root;

  constructor() {}

  show(options: DialogOptions) {
      if (this.root) this.root.unmount();
      let dialogContainer = document.getElementById('plugin-interpretation-dialog');
      if (!dialogContainer) {
        dialogContainer = document.createElement('div');
        dialogContainer.id = 'plugin-interpretation-dialog';
        const conferenceContainer = document.getElementById('conference-container');
        conferenceContainer.appendChild(dialogContainer);
        
      }
      this.root = ReactDOM.createRoot(dialogContainer);
      this.root.render(<Dialog
          title={options.title}
          content={options.content}
          cancelText={options.cancelText ? options.cancelText : 'Cancel'}
          cancelCallback={() => {this.hide(); if (options.cancelCallback) options.cancelCallback()}}
          acceptText={options.acceptText}
          acceptCallback={(value: any) => {this.hide(); if (options.acceptCallback) options.acceptCallback(value)}}
          selectValues={options.selectValues}
          pinRequired={options.pinRequired}
        />
      );
  }

  hide() {
    this.root.unmount();
  }
}
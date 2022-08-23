import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import { Dialog } from './Dialog/Dialog';
import { OptionType } from '../../typings';

interface DialogOptions {
  title: string,
  content?: string;
  cancelText?: string;
  cancelCallback?: Function;
  acceptText?: string;
  acceptCallback?: Function;
  loadOptions?: any;
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
          loadOptions={options.loadOptions}
          pinRequired={options.pinRequired}
        />
      );
  }

  hide() {
    // After selecting an sub-room the PIN dialog is displayed if needed. This causes a weird behavior. A dialog disappear for an instances an another appears.
    // With this delay the dialog seams to change.
    const root = this.root;
    setTimeout( () => root?.unmount(), 100);
  }
}
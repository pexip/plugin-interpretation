import { createCheckers } from 'ts-interface-checker';

import configTI from '../config/config-ti';
import { Config } from '../config/config';
import { SubRoomService } from './sub-room/sub-room';
import { DialogService } from './dialog/dialog';
import { StatusPanelService } from './status-panel/status-panel';
import { OptionType } from '../typings';

export class InterpretationService {

  private subRoomService: SubRoomService;
  private dialogService: DialogService;
  private statusPanelService: StatusPanelService;
  private currentLanguage: OptionType;

  constructor(
    private config: Config,
    private state$: any
  ) {
    if (!config) {
      throw Error('Cannot read the "configuration" attribute from package.json')
    }
    const {Config} = createCheckers(configTI);
    try {
      Config.check(config);
    } catch (error) {
      throw Error(error + ' in the "configuration" attribute form package.json')
    }
    this.dialogService = new DialogService();
    this.subRoomService = new SubRoomService(
      this.config.isInterpreter,
      this.dialogService
    );
    this.statusPanelService = new StatusPanelService(this.config.isInterpreter);
    this.updateIconState();
  }

  toggleInterpretation() {

    let action = '';
    let selectValues = null;
    let acceptCallback = null;
    
    if (this.subRoomService.isConnected()) {
      acceptCallback = () => this.subRoomService.disconnect();
      if (this.config.isInterpreter) {
        action = 'Finish';
      } else {
        action = 'Leave';
      }
    } else {
      selectValues = this.config.languages.map( (language) => {return {
        value: language[0],
        label: language[1]
      }});
      acceptCallback = this.startInterpretation.bind(this);
      if (this.config.isInterpreter) {
        action = 'Start';
      } else {
        action = 'Join';
      }
    }
    const acceptText = action;
    this.dialogService.show({
      title: `${action} interpretation`,
      content: `Do you want to ${action.toLowerCase()} the interpretation? ${ !this.subRoomService.isConnected() ? 'Please, select a language:' : ''}`,
      cancelText: undefined,
      cancelCallback: undefined,
      acceptText: acceptText,
      acceptCallback: acceptCallback,
      selectValues: selectValues
    })
    
  }

  disconnect() {
    this.subRoomService.disconnect();
    this.dialogService.hide();
    this.statusPanelService.hide();
  }

  private startInterpretation(language: OptionType) {
    this.currentLanguage = language;
    if (this.config.isInterpreter) {
      (window as any).PEX.dispatchAction({type: '[Conference] Mute Microphone'});
    } else {
      this.setMainRoomVolume(this.config.listenerVolume);
    }
    this.statusPanelService.show(language.label, this.subRoomService.isConnected());
    this.subRoomService.connect(language.value, this.onSubRoomConnect.bind(this), this.onSubRoomDisconnect.bind(this));
    this.updateIconState();
  }

  private setMainRoomVolume(value: number) {
    const video = document.getElementById("mainVideo") as HTMLVideoElement;
    const audioBar = document.querySelector(".toolbar-audio-bar-fill") as HTMLDivElement;
    video.volume = value;
    audioBar.style.width = value * 100 + '%';
  }


  private updateIconState() {
    let state;
    const active = this.subRoomService.isConnected();
    if (this.config.isInterpreter) {
      state = {
        icon: `assets/images/interpreter.svg#${active ? 'on' : 'off'}`,
        label: `${active ? 'Stop' : 'Start'} live interpretation`
      }
    } else {
      state = {
        icon: `assets/images/listener.svg#${active ? 'on' : 'off'}`,
        label: `${active ? 'Leave' : 'Join'} live interpretation`
      }
    }
    this.state$.next(state);
  }

  private onSubRoomConnect() {
    this.statusPanelService.show(this.currentLanguage.label, this.subRoomService.isConnected());
  }

  private onSubRoomDisconnect() {
    this.statusPanelService.hide();
    this.updateIconState();
    if (this.config.isInterpreter) {
      (window as any).PEX.dispatchAction({type: '[Conference] Unmute Microphone'});
    } else {
      this.setMainRoomVolume(1);
    }
  }

}
import { createCheckers } from 'ts-interface-checker';

import configTI from '../config/config-ti';
import { Config } from '../config/config';
import { SubRoomService } from './sub-room/sub-room';
import { DialogService } from './dialog/dialog';
import { StatusPanelService } from './status-panel/status-panel';
import { OptionType, RoomType } from '../typings';
import { FilterActiveLanguagesService } from './filter-active-languages/filter-active-languages';

export class InterpretationService {

  private subRoomService: SubRoomService;
  private dialogService: DialogService;
  private filterActiveLanguagesService: FilterActiveLanguagesService;
  private statusPanelService: StatusPanelService;
  private currentLanguage: OptionType;

  private audioMuteButtonState: boolean;
  private speakRoom: RoomType;

  constructor(
    private isInterpreter: boolean,
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
    this.filterActiveLanguagesService = new FilterActiveLanguagesService(
      this.config.languages,
      this.config.filterActiveLanguages.simultaneousScans
    );
    this.subRoomService = new SubRoomService(
          isInterpreter,
          this.dialogService
        );
    this.statusPanelService = new StatusPanelService(
      this.isInterpreter,
      this.config.interpreterCanToggleRoom,
      this.handleChangeInterpreterSpeakRoom.bind(this)
    );
    this.updateIconState();
    this.speakRoom = RoomType.Main;
    this.audioMuteButtonState = this.config.startAudioMuted;
    this.initializeAudioMuteButton();
  }

  toggleInterpretation() {

    let action = '';
    let loadOptions = null;
    let acceptCallback = null;
    
    if (this.subRoomService.isConnected()) {
      acceptCallback = () => this.subRoomService.disconnect();
      if (this.isInterpreter) {
        action = 'Finish';
      } else {
        action = 'Leave';
      }
    } else {
      if (!this.isInterpreter && this.config.filterActiveLanguages.enabled) {
        loadOptions = (inputText: String) => {
          return this.filterActiveLanguagesService.getActiveLanguages().then( (languages) => {
            return languages.map( (language) => {
              return {
                value: language[0],
                label: language[1]
              }
            });
          });
        };
      } else {
        loadOptions = (inputText: string) => {
          return Promise.resolve(this.config.languages.map( (language) => {
            return {
              value: language[0],
              label: language[1]
            }
          }));
        };
      }
      acceptCallback = this.startInterpretation.bind(this);
      if (this.isInterpreter) {
        action = 'Start';
      } else {
        action = 'Join';
      }
    }
    const acceptText = action;
    this.dialogService.show({
      title: `${action} interpretation`,
      content: `Do you want to ${action.toLowerCase()} the interpretation? ${ !this.subRoomService.isConnected() ? 'Please, select a language:' : ''}`,
      acceptText: acceptText,
      acceptCallback: acceptCallback,
      loadOptions: loadOptions
    })
    
  }

  disconnect() {
    this.subRoomService.disconnect();
  }

  private startInterpretation(language: OptionType) {
    this.currentLanguage = language;
    this.statusPanelService.show(language.label, this.subRoomService.isConnected());
    this.subRoomService.connect(language, this.onConnect.bind(this), this.onDisconnect.bind(this), this.config.reuseListenerPin);
    this.speakRoom = RoomType.SubRoom;
    (window as any).PEX.pexrtc.muteAudio(true);
    this.subRoomService.muteAudio(this.audioMuteButtonState);
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
    if (this.isInterpreter) {
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

  private onConnect() {
    this.statusPanelService.show(this.currentLanguage.label, this.subRoomService.isConnected());
    if (this.isInterpreter) {
      // (window as any).PEX.dispatchAction({type: '[Conference] Mute Microphone'});
    } else {
      this.setMainRoomVolume(this.config.listenerVolume);
    }
    this.updateIconState();
  }

  private onDisconnect() {
    this.dialogService.hide();
    this.statusPanelService.hide();
    this.updateIconState();
    if (!this.isInterpreter) {
      this.setMainRoomVolume(1);
    }
    this.speakRoom = RoomType.Main;
    (window as any).PEX.pexrtc?.muteAudio(this.audioMuteButtonState);
  }

  /**
   * Used by the interpreter for choosing the room he wants to talk to.
   * @param room RoomType that the interpreter selected.
   */
  private handleChangeInterpreterSpeakRoom(room: RoomType) {
    this.speakRoom = room;
    // Configure the mute state
    if (this.audioMuteButtonState) {
      (window as any).PEX.pexrtc.muteAudio(true);
      this.subRoomService.muteAudio(true);
    } else {
      if (room === RoomType.Main) {
        (window as any).PEX.pexrtc.muteAudio(false);
        this.subRoomService.muteAudio(true);
      } else {
        (window as any).PEX.pexrtc.muteAudio(true);
        this.subRoomService.muteAudio(false);
      }
    }
  }

  private initializeAudioMuteButton() {
    (window as any).PEX.actions$.subscribe((action: any) => {
      if (action.type === "[Conference] Unmute Microphone") {
        this.audioMuteButtonState = false;
        if (this.speakRoom === RoomType.SubRoom) {
          // TODO: Check if we need the timeout of we have a better approach
          setTimeout( () => (window as any).PEX.pexrtc.muteAudio(true), 1000);
          this.subRoomService.muteAudio(false);
        }
      }
      if (action.type === "[Conference] Mute Microphone") {
        this.audioMuteButtonState = true;
        this.subRoomService.muteAudio(true);
      }
    })
  }

}
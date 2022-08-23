import { Subject } from "rxjs";

export class FilterActiveLanguagesService {


  //activeLanguages$ = new Subject<Array<[string, string]>>();

  constructor(private languages: Array<[string, string]>) {}

  async getActiveLanguages() {
    const activeLanguages: Array<[string, string]> = [];
    for (let i = 0; i < this.languages.length; i++) {
      if (await this.isLanguageActive(this.languages[i][0])) {
        activeLanguages.push(this.languages[i])
        //this.activeLanguages$.next(activeLanguages);
      }
    }
    return activeLanguages;
  }

  private isLanguageActive(languageCode: String) {

    return new Promise<Boolean>( (resolve, reject) => {

      const pexRtcMainRoom = (window as any).PEX.pexrtc;

      // @ts-ignore
      const pexrtc = new PexRTC();

      const disconnect = () => pexrtc.disconnect();

      pexrtc.onError = (error: Error) => { reject(error) };
      pexrtc.onConnect = () => {
        window.addEventListener('beforeunload', disconnect);
      };

      pexrtc.onConferenceUpdate = (properties: any) => {
        // Conference empty
        window.removeEventListener('beforeunload', disconnect);
        pexrtc.disconnect();
        if (properties.started === false) {       
          resolve(false);
        } else {
          resolve(true);
        }
      }

      pexrtc.onSetup = (localStream: MediaStream, pinStatus: string, conferenceExtension: string) => {
        var pin = '';
        if (pinStatus === 'required' || pinStatus === 'optional') {
          pin = pexRtcMainRoom.pin;
        }
        pexrtc.connect(pin);
      }

      pexrtc.makeCall(
        pexRtcMainRoom.node,
        pexRtcMainRoom.conference + languageCode,
        pexRtcMainRoom.display_name,
        undefined,
        'none'
      );
    });
  }

}
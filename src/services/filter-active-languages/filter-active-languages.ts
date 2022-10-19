import { Subject } from "rxjs";

export class FilterActiveLanguagesService {

  constructor(
    private languages: Array<[string, string]>,
    private simultaneousScans: number
  ) {}

  async getActiveLanguages() {
    const activeLanguages: Array<[string, string]> = [];
    for (let i = 0; i < this.languages.length; i += this.simultaneousScans) {
      let maxScans = this.simultaneousScans;
      // Check if it's the last one
      if (this.languages.length - i < this.simultaneousScans) {
        maxScans = this.languages.length % this.simultaneousScans;
      }
      const promises: Promise<Boolean>[] = [];
      for (let j = 0; j < maxScans; j++) {
        const index = i + j;
        const promise = this.isLanguageActive(this.languages[index][0]).then( (active) => {
          if (active) activeLanguages.push(this.languages[index]); 
          return active;
        });
        promises.push(promise);
      }
      await Promise.all(promises);
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
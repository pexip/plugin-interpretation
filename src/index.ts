import { InterpretationService } from './services/interpretation';
import { InterpreterIndicatorService } from './services/roster-list/role-indicator/interpreter-indicator';

let interpretationService: InterpretationService;
let interpreterIndicatorService : InterpreterIndicatorService;

const state$ = (window as any).PEX.pluginAPI.createNewState({});

const load = async () => {
  let response: Response;
  const filePath = './custom_configuration/plugins/interpretation/plugin.json';
  try {
    response = await fetch(filePath);
  } catch {
    throw Error(`Cannot retrieve the file "${filePath}"`);
  }
  if (response.status != 200) {
    throw Error(`Cannot retrieve file "${filePath}"`);
  } 
  const json = await response.json();
  (window as any).PEX.actions$.ofType('[Conference] Connect Success').subscribe( (action: any) => {
    const configuration = json.configuration;
    if (configuration.startAudioMuted) {
      (window as any).PEX.dispatchAction({type: '[Conference] Mute Microphone'});
    }
    if (configuration.startVideoMuted) {
      (window as any).PEX.dispatchAction({type: '[Conference] Mute Camera'});
    }
    if (configuration.showInterpreterIconInRosterList) {
      interpreterIndicatorService = new InterpreterIndicatorService(configuration.isInterpreter);
    }
    interpretationService = new InterpretationService(configuration, state$);
  });
  (window as any).PEX.actions$.ofType('[Conference] Disconnect').subscribe(() => {
    interpretationService.disconnect();
  });
}

(window as any).PEX.pluginAPI.registerPlugin({
  id: 'interpretation-plugin',
  load: load,
  unload: () => console.log('Interpreter Plugin', 'Unloaded'),
  state$: state$,
  toggleInterpretation: () => interpretationService.toggleInterpretation()
});
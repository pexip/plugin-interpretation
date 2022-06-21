import { InterpretationService } from './services/interpretation';
import { MonitorService } from './services/monitor/monitor';
import { RoleIndicatorService } from './services/roster-list/role-indicator/role-indicator';

let interpretationService: InterpretationService;
let roleIndicatorService : RoleIndicatorService;
let monitorService: MonitorService;

const state$ = (window as any).PEX.pluginAPI.createNewState({});

const queryParams = new URLSearchParams(window.location.search);

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
 
  const configuration = json.configuration;

     // The moderator shouldn't have an extra role icon
  const isModerator = !json.menuItems?.toolbar;

  if (configuration.roleIndicator) {
    roleIndicatorService = new RoleIndicatorService(queryParams);
    // The moderator doesn't notify his role
    if (isModerator) {
      roleIndicatorService.cleanRole();
    } else {
      roleIndicatorService.setRole(configuration.isInterpreter);
    }
  }

  if (configuration.subRoomMonitor) {
    monitorService = new MonitorService(configuration.languages);
  }

  (window as any).PEX.actions$.ofType('[Conference] Connect Success').subscribe( (action: any) => {
    if (configuration.startAudioMuted) {
      (window as any).PEX.dispatchAction({type: '[Conference] Mute Microphone'});
    }
    if (configuration.startVideoMuted) {
      (window as any).PEX.dispatchAction({type: '[Conference] Mute Camera'});
    }
    if (configuration.showRoleIndicator) {
      roleIndicatorService.init();
    }
    interpretationService = new InterpretationService(configuration, state$);
  });
  if (configuration.subRoomMonitor) {
    (window as any).PEX.actions$.ofType('[Conference] Set remote call type').subscribe( (action: any) => {
      monitorService.init();
    });
  }
  
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
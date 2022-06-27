import { InterpretationService } from './services/interpretation';
import { MonitorSubRoomsService } from './services/monitor-subrooms/monitor-subrooms';
import { RoleIndicatorService } from './services/role-indicator/role-indicator';

let interpretationService: InterpretationService;
let roleIndicatorService : RoleIndicatorService;
let monitorSubRoomsService: MonitorSubRoomsService;

const state$ = (window as any).PEX.pluginAPI.createNewState({});

let queryParams = new URLSearchParams(window.location.search);

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
    roleIndicatorService = new RoleIndicatorService();
    // The moderator doesn't notify his role
    if (isModerator) {
      roleIndicatorService.cleanRole(queryParams);
    } else {
      roleIndicatorService.setRole(queryParams, configuration.isInterpreter);
    }
  }

  if (configuration.monitorSubRooms.enabled) {
    monitorSubRoomsService = new MonitorSubRoomsService(
      configuration.languages,
      configuration.monitorSubRooms.rescanInterval,
      configuration.monitorSubRooms.guestPin
    );
  }

  (window as any).PEX.actions$.ofType('[Home] Screen state').subscribe( (action: any) => {
    queryParams = new URLSearchParams(window.location.search);
    if (configuration.roleIndicator) {
      if (isModerator) {
        roleIndicatorService.cleanRole(queryParams);
      } else {
        roleIndicatorService.setRole(queryParams, configuration.isInterpreter);
      }
    }
  });

  (window as any).PEX.actions$.ofType('[Conference] Connect Success').subscribe( (action: any) => {
    if (configuration.startAudioMuted) {
      (window as any).PEX.dispatchAction({type: '[Conference] Mute Microphone'});
    }
    if (configuration.startVideoMuted) {
      (window as any).PEX.dispatchAction({type: '[Conference] Mute Camera'});
    }
    if (configuration.roleIndicator) {
      roleIndicatorService.init();
    }
    interpretationService = new InterpretationService(configuration, state$);
  });

  if (configuration.monitorSubRooms.enabled) {
    (window as any).PEX.actions$.ofType('[Conference] Set remote call type').subscribe( (action: any) => {
      monitorSubRoomsService.init();
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
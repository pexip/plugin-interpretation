import { Role } from './config/config';
import { InterpretationService } from './services/interpretation';
import { MonitorSubRoomsService } from './services/monitor-subrooms/monitor-subrooms';
import { RoleIndicatorService } from './services/role-indicator/role-indicator';

let interpretationService: InterpretationService;
let roleIndicatorService : RoleIndicatorService;
let monitorSubRoomsService: MonitorSubRoomsService;

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

  const pluginId = json.id;
  const configuration = json.configuration;
  const menuItemId = json.menuItems.toolbar[0].id;

  let queryParams = new URLSearchParams(window.location.search);
  const role = getRole(configuration.role, queryParams);

  if (configuration.roleIndicator) {
    roleIndicatorService = new RoleIndicatorService();
    // The moderator doesn't notify his role
    if (role === Role.MODERATOR) {
      roleIndicatorService.cleanRole(queryParams);
    } else {
      roleIndicatorService.setRole(queryParams, role);
    }
  }

  if (role === Role.MODERATOR) {
    monitorSubRoomsService = new MonitorSubRoomsService(
      configuration.languages,
      configuration.monitorSubRooms.rescanInterval,
      configuration.monitorSubRooms.guestPin,
      configuration.monitorSubRooms.simultaneousScans
    );
    (window as any).PEX.actions$.ofType('[Conference] Set remote call type').subscribe( (action: any) => {
      (window as any).PEX.pluginAPI.getPluginMenuItem(pluginId, menuItemId).hide();
      monitorSubRoomsService.init();
    });
  }

  (window as any).PEX.actions$.ofType('[Home] Screen state').subscribe( (action: any) => {
    queryParams = new URLSearchParams(window.location.search);
    if (configuration.roleIndicator) {
      if (role === Role.MODERATOR) {
        roleIndicatorService.cleanRole(queryParams);
      } else {
        roleIndicatorService.setRole(queryParams, role);
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
    if (role === Role.INTERPRETER || role === Role.LISTENER) {
      const isInterpreter = role === Role.INTERPRETER;
      interpretationService = new InterpretationService(isInterpreter, configuration, state$);
    }
  });
  
  (window as any).PEX.actions$.ofType('[Conference] Disconnect').subscribe(() => {
    if (role === Role.INTERPRETER || role === Role.LISTENER) {
      interpretationService?.disconnect();
    }
  });
  
}

function getRole(role: Role, queryParams: URLSearchParams): Role {
  if (role === Role.AUTO) {
    const queryRole = queryParams.get("callTag");
    switch (queryRole) {
      case Role.INTERPRETER:
      case Role.MODERATOR:
      case Role.LISTENER:
        localStorage.setItem('pexInterpretationRole', queryRole);
        return queryRole;
      default:
        let savedRole = localStorage.getItem('pexInterpretationRole') as Role;
        if (!savedRole) {
          savedRole = Role.LISTENER;
        }
        return savedRole;
    }
  }
  return role;
}

(window as any).PEX.pluginAPI.registerPlugin({
  id: 'interpretation-plugin',
  load: load,
  unload: () => console.log('Interpreter Plugin', 'Unloaded'),
  state$: state$,
  toggleInterpretation: () => interpretationService.toggleInterpretation()
});
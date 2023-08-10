import { Role } from './config/config';
import { InterpretationService } from './services/interpretation';
import { MonitorSubRoomsService } from './services/monitor-subrooms/monitor-subrooms';
import { RoleIndicatorService } from './services/role-indicator/role-indicator';

let interpretationService: InterpretationService;
let roleIndicatorService : RoleIndicatorService;
let monitorSubRoomsService: MonitorSubRoomsService;

const state$ = (window as any).PEX.pluginAPI.createNewState({});

const localStorageKey = 'pexInterpretationRole'

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

  let role: Role;
  if (configuration.role === Role.AUTO) {
    role = getRole();
  } else {
    role = configuration.role;
  }
  (window as any).role = role

  if (configuration.roleIndicator) {
    roleIndicatorService = new RoleIndicatorService();
    const callTag = getCallTag()
    if (callTag == null) {
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set('callTag', role)
      window.location.search = queryParams.toString();
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
    if (configuration.roleIndicator) {
      const callTag = getCallTag()
      if (callTag == null) {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('callTag', role)
        window.location.search = queryParams.toString();
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

function getRole(): Role {
  const callTag = getCallTag()
  switch (callTag) {
    case Role.INTERPRETER:
    case Role.MODERATOR:
    case Role.LISTENER:
      localStorage?.setItem(localStorageKey, callTag);
      return callTag;
    default:
      let savedRole = localStorage?.getItem(localStorageKey) as Role;
      if (!savedRole) {
        savedRole = Role.LISTENER;
      }
      return savedRole;
  }
}

const getCallTag = (): string => {
  let callTag = (window as any).PEX.conferenceQueryParams?.callTag;
  if (callTag == null) {
    const queryParams = new URLSearchParams(window.location.search);
    callTag = queryParams.get('callTag');
  }
  return callTag
}

(window as any).PEX.pluginAPI.registerPlugin({
  id: 'interpretation-plugin',
  load: load,
  unload: () => console.log('Interpreter Plugin', 'Unloaded'),
  state$: state$,
  toggleInterpretation: () => interpretationService.toggleInterpretation()
});
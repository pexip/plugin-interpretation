import * as React from "react";
import PublicIcon from '@mui/icons-material/Public';
import HomeIcon from '@mui/icons-material/Home';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Tooltip } from "@mui/material";
import { SelectedRoom } from "../../../typings";

import './StatusPanel.scss';

interface StatusProps {
  isInterpreter: boolean;
  language: string;
  connected: boolean;
}

const StatusPanel = (props: StatusProps): JSX.Element => {
  const interpreterIcon = "custom_configuration/plugins/interpretation/assets/images/interpreter.svg#on";
  const listenerIcon = "custom_configuration/plugins/interpretation/assets/images/listener.svg#on";

  const [selectedRoom, setSelectedRoom] = React.useState(SelectedRoom.InterpretationRoom)

  const handleSelectRoom = (
    event: React.MouseEvent<HTMLElement>,
    value: number | null,
  ) => {
    console.log(value)
    if (value != null)
      setSelectedRoom(value);
  }

  console.log(selectedRoom);

  return (
    <div className="StatusPanel">
      { props.connected
        ? <svg className="icon">
            <use href={props.isInterpreter ? interpreterIcon : listenerIcon}/>
          </svg>
        : <div className="loading-spinner"></div>
      }
      {props.language}
      <ToggleButtonGroup
        value={selectedRoom}
        onChange={handleSelectRoom}
        exclusive
        >
        
        <ToggleButton value={SelectedRoom.InterpretationRoom} aria-label="interpretation room">
          <Tooltip title={<h3 style={{ margin: 0 }}>Talk to interpretation room</h3>} >
            <PublicIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value={SelectedRoom.MainRoom} aria-label="main room">
          <Tooltip title={<h3 style={{ margin: 0 }}>Talk to main room</h3>}>
            <HomeIcon />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  )
  
}

export default StatusPanel;

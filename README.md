# Interpretation Plugin

This plugin helps the participants of a conference to understand what is going on in a conference when they don't speak the presenter's language. For that we have a special role of a participant (interpreter). This user can join to an special sub-room and start translating all of which he is hearing.

Once this plugin is active, the users will have the following behavior:

- Interpreter: Can hear the main room and speak to the language sub-room. He can't speak to the main room. When connecting to the language sub-room, the video in the main room is disabled.
- Listener: He can only speak to the main room. He can hear the interpreter with volume=100% and also the main room with the value defined in the configuration (parameter `listenerVolume`).

The sub-room has the following structure `<main-room><language-code>`. It's explained with more detail in the section *Configure the plugin*.


## Prerequisites

The only prerequisite for building this project is to have `node` and `npm` in your system. At this moment we are using the following versions:

- node: `16.14.2`
- npm:  `8.5.0`

Other `node` and `npm` could work, but it's recommended to use the same versions.

## Generate a production package

For generating the production package we need follow the next steps:

Install the `node` dependencies:

    $ npm install

Build a production package:

    $ npm run build

This will create a  `dist` folder with the follow architecture:

```
📁 dist
↳ 📁 plugins
  ↳ 📁 interpretation
    ↳ 📁 assets
      ↳ 📁 images
        ↳ 📄 interpreter.svg
        ↳ 📄 listener.svg
    ↳ 📄 index.js
    ↳ 📄 index.js.LICENSE.txt
    ↳ 📄 plugin.json
```

The main files are these two:

- `index.js`: Contains the whole minified JavaScript code for this plugin.
  
- `plugin.json`: Defines the plugin configuration. In the following section we will learn how to modify these values.

## Available roles

In this plugin there are three types of roles that will depend on the configuration.

### Interpreter

This is the participant that will act as a interpreter for any of the available languages. Once this user joins a interpretation room, he will have the following experience:

- The user will be muted, but he will be able to talk to the main room. The volume of this room will be at the 100% of its original volume (or less if the user modified the volume slider).
- The user will be able to talk to the interpretation room. There is not button to mute this channel. He will to disconnect from it.
- The user will see a panel on the bottom-left corner indicating the role and interpretation room where he is connected.


### Listener

This participant will use the plugin to connect to an interpretation room. Once he is connected, the user will have the following experience:

- The user will still be able to talk to the main room, but the volume of this room will be at the 10% of its original volume. However, this value can be changed by configuration. The user can also modify a slider to increase or reduce the volume in the main room.
- The user will hear the interpretation room a the 100 % of the volume. He won't be able to speak in this channel. 
- The user will see a panel on the bottom-left corner indicating the role and interpretation room where he is connected.

### Moderator

This is a special type of user and its purpose is of managing and monitoring the conference. This user should be the conference host and have the `monitorSubRoom` enabled to display the list of user in the interpretation room on the bottom-left corner.


## Configure the plugin

This plugin allow to configure its behavior. It can be done by modifying the file `plugin.json`:

| Parameter         | Type                    | Description  |
| ----------------- | ----------------------- | ------------ |
| role     | String                 | Indicates the user role. Depending on the role the behaviour will be different. Possible values are `"interpreter"`, `"listener"` or `"auto"`. In case of `"auto"`, the role should be defined in a URL query parameter called `interpreterRole`. This parameter will have two possible values: `"interpreter"` or `"listener"`. |
| languages         | Array<[string, string]> | Array in with element has a pair of value. The first value is the language code for creating the sub-room and the other the label. For example, an **element** of this array could be `["001", "English"]`. The first is used for creating the sub-room. If the main room is `"123"` the sub-room will be `"123001"`. The second value is used in the interface for referring to that language. |
| listenerVolume    | number                  | Volume for the listener for the main room when he is connected to a interpretation room. The value should be between 0 and 1. |
| startAudioMuted   | boolean                 | If true, the client will join to the main room with his audio muted. |
| startVideoMuted   | boolean                 | If true, the client will join to the main room with his video muted. |
| reuseListenerPin  | boolean                 | It's a feature for the listener, not the interpreter. If true, instead or displaying the PIN dialog when a PIN is required, it will try to reuse the main room PIN in the language room. |
| roleIndicator | boolean                     | If true, it shows the role (interpreter or listener) in the roster list. |
| filterActiveLanguages.enabled  | boolean | If enabled, it will display in the interpretation dialog only the languages that have an interpreter (host user) is connected. |
| filterActiveLanguages.simultaneousScans | number | This value should be 1 or higher and it indicates the number of scans that it can perform simultaneously. Increasing this number will make the detection faster. Take into account that each scan consumes a license during the scanning time. If this number is 5, these feature will consume a maximum of 5 Port licenses. |
| monitorSubRoom | Object | Show a panel in the bottom-left corner with all the users connected to an interpretation room. This panel is only available for the role `"moderator"`.|
| monitorSubRoom.rescanInterval | number | Time in milliseconds for another rescan. Only works if the panel is opened. |
| monitorSubRoom.guestPin | string | The guestPin used to check the language rooms.  |
| monitorSubRoom.simultaneousScans | number | This value should be 1 or higher and it indicates the number of scans that it can perform simultaneously. Increasing this number will make the detection faster. Take into account that each scan consumes a license during the scanning time. If this number is 5, these feature will consume a maximum of 5 Port licenses. |

In the following lines we will see some examples of configurations depending on the user role.

### Moderator

If we want to use this plugin for supervising, we will remove the ability of joining to a interpretation room, but leave some features that give us some information.

We can **remove** the button for starting the interpretation by remove the following lines:

```json
  /* DELETE FROM HERE*/
  "menuItems": {
    "toolbar": [{
      "action": "toggleInterpretation"
    }]
  },
  /* TO HERE */
```
An the rest of the configuration will be something like this:

```json
  "configuration": {
    "role": "moderator",
    "listenerVolume": 0.1,
    "startAudioMuted": false,
    "startVideoMuted": false,
    "reuseListenerPin": true,
    "roleIndicator": true,
    "filterActiveLanguages": false,
    "monitorSubRooms": {
      "enabled": true,
      "rescanInterval": 30000,
      "guestPin": "4321",
      "simultaneousScans": 1
    },
    "languages": [
      ["0359", "Bulgarian"],
      ["0420", "Czech"]
    ]
  }
```

With this configuration with achieve the following:

- User joins with microphone and camera enabled (`startAudioMuted` and `startVideoMuted`).
- The user can see the role of other participants in the roster list (`roleIndicator`).
- There is a panel on the bottom right corner with all the users that are connected to the interpretation rooms (`monitorSubRooms`). We scan every room each 30 seconds (`rescanInterval`). The guestPin for all the subrooms should be 4321 (guestPin).

### Interpreter

For the interpreter, we will need the toolbar button and to modify a little the configuration:

```json
  "menuItems": {
    "toolbar": [{
      "action": "toggleInterpretation"
    }]
  },
  "configuration": {
    "role": "interpreter",
    "listenerVolume": 0.1,
    "startAudioMuted": false,
    "startVideoMuted": true,
    "reuseListenerPin": true,
    "roleIndicator": true,
    "filterActiveLanguages": {
      "enabled": false,
      "simultaneousScans": 1
    }
    "monitorSubRooms": {
      "rescanInterval": 30000,
      "guestPin": "" ,
      "simultaneousScans": 1
    },
    "languages": [
      ["0359", "Bulgarian"],
      ["0420", "Czech"]
    ]
  }
}

```

With this configuration, we will have the following:

- We define the user role as interpreter (`isInterpreter`).
- User joins with microphone enabled, but with camera disabled (`startAudioMuted` and `startVideoMuted`).
- The user role of the other participants is displayed in the roster list (`roleIndicator`). The difference with the moderator is that in this case, it also notify its role to other participants.

### Listener

For the user the configuration is very similar, but with a couple of modifications:

```json
  "menuItems": {
    "toolbar": [{
      "action": "toggleInterpretation"
    }]
  },
  "configuration": {
    "role": "listener",
    "listenerVolume": 0.1,
    "startAudioMuted": true,
    "startVideoMuted": true,
    "reuseListenerPin": true,
    "roleIndicator": true,
    "filterActiveLanguages": {
      "enabled": false,
      "simultaneousScans": 1
    }
    "monitorSubRooms": {
      "rescanInterval": 30000,
      "guestPin": "",
      "simultaneousScans": 1
    },
    "languages": [
      ["0359", "Bulgarian"],
      ["0420", "Czech"]
    ]
  }
}
```

With this configuration we get the following:

- We define the user role as listener (`isInterpreter`).
- User joins with microphone and camera disabled (`startAudioMuted` and `startVideoMuted`).
- When the user is connected to a interpretation room, the volume of the main room will be a 10% of the total (`listenerVolume`).
- When the user joins a interpretation room, he will use automatically the same pin that he used for the main room. This means that he won't be disturbed by a dialog (`reuseListenerPin`).
- The user role of the other participants is displayed in the roster list (`roleIndicator`). This service also notify its own role to other participants.
- We only show the languages that are active in that moment (`filterActiveLanguages`). An active language is the one that as an interpreter (host user).

## Testing in local

The first step before testing in local is to configure the file `.npmrc`. In this file we will have to define the following parameters:

- `CONFERENCING_NODE_URL`: The URL of the Conferencing Node that you want to use for testing.
- `INTERPRETER_PORT`: The local port for using for the interpreter.
- `LISTENER_PORT`: The local port for using for the listener.

The first step is to compile the node dependencies:

    $ npm install

If we want to launch the interpreter we will use the following command:

    $ npm run start-interpreter

For the listener, you can use this command:

    $ npm run start-listener

## Local policies example

An easy way to test the plugin is to use a local policy. In this case we designed a local policy for testing. It will allow every VMR with 2 or 6 digits and will use the pins 1234 for the hosts and 4321 for the guests.

```python
{
  {% if (call_info.local_alias | pex_regex_replace('^(\d{2}|\d{6})$',  '') == '')  %}
    "action": "continue",
    "result": {
        "service_type": "conference",
        "name": "{{call_info.local_alias}}",
        "service_tag": "pexip-interpreter",
        "description": "",
        "call_tag": "",
        "pin": "1234",
        "guest_pin": "4321",
        "guests_can_present": true,
        "allow_guests": true,
        "view": "four_mains_zero_pips",
        "ivr_theme_name": "visitor_normal",
        "locked": false,
        "automatic_participants": []
     }
  {% else %}
    "action": "reject",
    "result": {}
  {% endif %}
}

```

If you are using the `monitorSubRooms` feature, you will want to use a different `guest_pin` for this feature and limit the access to this user. You can do it with the following local policy:

```python
{
  {% if (
    (call_info.call_tag == "interpreter-monitor-subrooms")
      and
    (call_info.local_alias | pex_regex_replace('^\d{6}$',  '') == '') )
  %}
    "action": "continue",
    "result": {{service_config | pex_update(
      {
        "guest_pin": "5789",
        "call_type": "none"
      }) | pex_to_json
    }}
  {% else %}
    "action": "continue",
    "result": {{service_config | pex_to_json}}
  {% endif %}
}
```

Here is the combination of the two local policies:

```python
{
  {% if (
    (call_info.call_tag == "interpreter-monitor-subrooms")
      and
    (call_info.local_alias | pex_regex_replace('^\d{6}$',  '') == '') )
  %}
    "action": "continue",
    "result":
      {
        "service_type": "conference",
        "name": "{{call_info.local_alias}}",
        "service_tag": "pexip-interpreter",
        "description": "",
        "pin": "1234",
        "guests_can_present": true,
        "allow_guests": true,
        "view": "four_mains_zero_pips",
        "ivr_theme_name": "visitor_normal",
        "locked": false,
        "automatic_participants": [],
        "enable_overlay_text": true,

        "call_tag": "interpreter-monitor-subrooms",
        "guest_pin": "5789",
        "call_type": "none"
    }
  {% else %}
    {% if (call_info.local_alias | pex_regex_replace('^(\d{2}|\d{6})$',  '') == '')  %}
      "action": "continue",
      "result": {
          "service_type": "conference",
          "name": "{{call_info.local_alias}}",
          "service_tag": "pexip-interpreter",
          "description": "",
          "call_tag": "",
          "pin": "1234",
          "guest_pin": "",
          "guests_can_present": true,
          "allow_guests": true,
          "view": "four_mains_zero_pips",
          "ivr_theme_name": "visitor_normal",
          "locked": false,
          "automatic_participants": [],
          "enable_overlay_text": true
      }
    {% else %}
      "action": "continue",
      "result": {{service_config | pex_to_json}}
    {% endif %}
  {% endif %}
}
```

## Add a new configuration parameter (developers only)

Suppose that your are developing a new functionality for this plugin and you need to add a new configuration parameter to the `plugin.json` file.

The first step is to add the new parameter to the file `src/config/config.ts`.

Now we need to recreate the file `config-ti.ts` through the following command:

    $ npx ts-interface-builder src/config/config.ts

Now the plugin will check if this parameter exists, is valid and display an error message if necessary.

Don't forget to modify the template located in `templates/plugin.json`.

## FAQ

- You receive the following error message when trying to connect to a interpretation when using the listener role: `Remote description failed DOMException: Failed to parse SessionDescription. m=video 0 UDP/TLS/RTP/SAVPF  Invalid value: .`
  - In this scenario the interpreter is configured as only audio emitter, but the listener as permission for receive *audio and video* (not emit them). Probably you have configured the interpretation VMR as only audio. You should go to the VMR `Advanced options` and change the `Conference capabilities` from `Audio-only` to `Main video only`. Wait a few minutes for the propagation to the Conferencing Nodes.
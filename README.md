# Interpretation Plugin

This plugin helps the participants of a conference to understand what is going on in a conference when they don't speak the presenter's language. For that we have a special role of a participant (interpreter). This user can join to an special sub-room and start translating all of which he is hearing.

Once this plugin is active, the users will have the following behavior:

- Interpreter: Can hear the main room and speak to the language sub-room. He can't speak to the main room. When connecting to the language sub-room, the video in the main room is disabled.
- Listener: He can only speak to the main room. He can hear the interpreter with volume=100% and also the main room with the value defined in the configuration (parameter `volumeListener`).

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

## Configure the plugin

This plugin allow to configure its behavior. It can be done by modifying the file `plugin.json`:

| Parameter        | Type                    | Description |
|------------------|-------------------------| ------------|
| isInterpreter    | boolean                 | Indicates the role of the | 
| listenerVolume   | number                  | Volume for the listener for the main room when he is connected to a interpretation room. The value should be between 0 and 1. |
| languages        | Array<[string, string]> | Array in with element has a pair of value. The first value is the language code for creating the sub-room and the other the label. For example, an **element** of this array could be `["001", "English"]`. The first is used for creating the sub-room. If the main room is `"123"` the sub-room will be `"123001"`. The second value is used in the interface for referring to that language.|
| startAudioMuted  | boolean                 | If true, the client will join to the main room with his audio muted. |
| startVideoMuted  | boolean                 | If true, the client will join to the main room with his video muted. |
| reuseListenerPin | boolean                 | It's a feature for the listener, not the interpreter. If true, instead or displaying the PIN dialog when a PIN is required, it will try to reuse the main room PIN in the language room.
| showRoleIndicator | boolean                | If true, it shows the role (interpreter or listener) in the roster list.

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

## Add a new configuration parameter

Suppose that your are developing a new functionality for this plugin and you need to add a new configuration parameter to the `plugin.json` file.

The first step is to add the new parameter to the file `src/config/config.ts`.

Now we need to recreate the file `config-ti.ts` through the following command:

    $ npx ts-interface-builder src/config/config.ts

Now the plugin will check if this parameter exists, is valid and display an error message if necessary.

Don't forget to modify the template located in `templates/plugin.json`.

## FAQ

- You receive the following error message when trying to connect to a interpretation when using the listener role: `Remote description failed DOMException: Failed to parse SessionDescription. m=video 0 UDP/TLS/RTP/SAVPF  Invalid value: .`
  - In this scenario the interpreter is configured as only audio emitter, but the listener as permission for receive *audio and video* (not emit them). Probably you have configured the interpretation VMR as only audio. You should go to the VMR `Advanced options` and change the `Conference capabilities` from `Audio-only` to `Main video only`. Wait a few minutes for the propagation to the Conferencing Nodes.
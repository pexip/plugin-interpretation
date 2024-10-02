import EventEmitter from 'eventemitter3'

export enum EventType {
  ConnectionStateChanged = 'connectionStateChanged',
  RequestConnectionState = 'requestConnectionState',
  changeMute = 'changeMute',
  changeLanguage = 'changeLanguage',
  muteChanged = 'muteChanged',
  languageChanged = 'languageChanged'
}

const events = new EventEmitter()

window.addEventListener('message', (event) => {
  if (event.data.type != null) {
    console.log(`Received event: `, event.data)
    events.emit(event.data.type, event.data.message)
  }
})

enum EventTarget {
  Plugin = 'plugin',
  Dialog = 'dialog'
}

export const IframeEvents = {
  sendEvent: (type: EventType, message?: any): void => {
    const frames = window.parent.frames

    const target = window.location.href.includes('dialog.html')
      ? EventTarget.Plugin
      : EventTarget.Dialog

    for (let i = 0; i < frames.length; i++) {
      try {
        if (
          (target === EventTarget.Dialog &&
            frames[i].location.href.includes('dialog.html')) ||
          (target === EventTarget.Plugin &&
            frames[i].location.href ===
              window.location.href.replace(/dialog.html.*/, ''))
        ) {
          console.log(`Sending event to "${target}" frame: `, {
            type,
            body: message
          })
          frames[i].postMessage({ type, message })
          break
        }
      } catch (e) {
        // Ignore the parent frame as it will throw an error when trying to access
      }
    }
  },
  addEventListener: (type: EventType, listener: (message: any) => void) => {
    events.addListener(type, listener)
  },
  removeEventListener: (type: EventType, listener: (message: any) => void) => {
    events.removeListener(type, listener)
  }
}

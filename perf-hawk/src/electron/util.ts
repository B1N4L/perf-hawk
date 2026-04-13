import {ipcMain, type WebContents, type WebFrameMain} from 'electron';

import { pathToFileURL} from "url";
import {getUIPath} from "./pathResolver.js";

export function isDev(): boolean {
    return process.env.NODE_ENV === 'development';
}

// Key extends keyof EventPayloadMapping: limiting key to any attribute inside EventPayloadMapping, so we can only use keys that are defined in EventPayloadMapping, which is a type that maps event names to their payload types. This ensures type safety when handling IPC events.
export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: () => EventPayloadMapping[Key] // if key is from EventPayloadMapping(eg: statistics), then the handler must return the corresponding payload type for that key(returns Statistics from EventPayloadMapping)
){ //key was set as a generic
    ipcMain.handle(key, (event) => {
        // event.senderFrame.url == getUIPath(); // this is not working for both dev and electron environments
        validateEventFrame(event.senderFrame); //generalized event frame validation for each ipcMainHandle call
        return handler();
    });
}

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    webContents: WebContents, // to which browser do we send this data towards? (in case we might have multiple windows in our app)
    payload: EventPayloadMapping[Key]
){ //key was set as a generic
    webContents.send(key, payload);
}




// path validations to prevent malicious events
export function validateEventFrame(frame: WebFrameMain | null) {
    console.log('validateEventFrame', frame?.url);
    if (!frame) {
        throw new Error('Malicious event: senderFrame is null');
    }

    if (isDev() && new URL(frame.url).host === 'localhost:5123') {
        return;
    }

    if (frame.url !== pathToFileURL(getUIPath()).toString()) {
        throw new Error('Malicious event');
    }
}
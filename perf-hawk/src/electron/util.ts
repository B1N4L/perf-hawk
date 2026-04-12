import {ipcMain, type WebContents} from 'electron';

export function isDev(): boolean {
    return process.env.NODE_ENV === 'development';
}

// Key extends keyof EventPayloadMapping: limiting key to any attribute inside EventPayloadMapping, so we can only use keys that are defined in EventPayloadMapping, which is a type that maps event names to their payload types. This ensures type safety when handling IPC events.
export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: () => EventPayloadMapping[Key] // if i passed key from EventPayloadMapping(eg: statistics), then the handler must return the corresponding payload type for that key(returns Statistics from EventPayloadMapping)
){ //key was set as a generic
    ipcMain.handle(key, () => handler());
}

// export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
//     key: Key,
//     handler: () => EventPayloadMapping[Key]
// ) {
//     ipcMain.handle(key, (event) => {
//         //validateEventFrame(event.senderFrame);
//         return handler();
//     });
// }

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    webContents: WebContents, // to which browser do we send this data towards? (in case we might have multiple windows in our app)
    payload: EventPayloadMapping[Key]
){ //key was set as a generic
    webContents.send(key, payload);
}
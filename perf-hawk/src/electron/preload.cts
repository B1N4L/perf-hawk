const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {

    subscribeStatistics: (callback) => {
        // electron.ipcRenderer.on("statistics", (_:any, stats:any)=>{ //is not type safe
        return ipcOn("statistics", (stats)=>{ //is type safe
            callback(stats);
        });
    },

    // getStaticData: () => electron.ipcRenderer.invoke("getStaticData"),
    getStaticData: () => ipcInvoke("getStaticData"),

} satisfies Window["electron"]) //electron object from window // satisfies: tells typescript we expect this object of this type, if it doesn't exist, throw an error.


function ipcInvoke<Key extends keyof EventPayloadMapping>(key: Key): Promise<EventPayloadMapping[Key]> {
    return electron.ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void
) {
    const cBack = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
    electron.ipcRenderer.on(key, cBack);
    return () => electron.ipcRenderer.off(key, cBack); // used to unsubscribe upon returning
}

function ipcSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    payload: EventPayloadMapping[Key]
) {
    electron.ipcRenderer.send(key, payload);
}

console.log("preload loaded");
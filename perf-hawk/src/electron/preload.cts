const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {

    subscribeStatistics: (callback) => {
        electron.ipcRenderer.on("statistics", (_:any, stats:any)=>{

            callback(stats);
        });
    },
    getStaticData: () => {
        return electron.ipcRenderer.invoke("getStaticData");
    },
} satisfies Window["electron"]) //electron object from window

console.log("preload loaded");
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
// satisfies: tells typescript we expect this object of this type, if it doesn't exist, throw an error.



console.log("preload loaded");
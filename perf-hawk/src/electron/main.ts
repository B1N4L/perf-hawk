import {app, BrowserWindow} from "electron"
import path from "path"

type test = string; // to check running in javascript. javascript doesn't know what a type is so an error will be thrown

//create an Electron app that user can interact with. this file is added to package.json's main path. main.ts will run once the Electron starts
app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        // width: 800,
        // height: 600,
        webPreferences: {
            // nodeIntegration: true,
            // contextIsolation: false
            devTools: true,
        }
    })
    //path.join does things like converting backslashes to forward slashes on Windows, also makes sure the path is correct for the operating system
    mainWindow.loadFile(path.join(app.getAppPath() + "/dist-react/index.html"));
});
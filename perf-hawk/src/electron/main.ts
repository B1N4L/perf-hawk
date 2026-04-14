import {app, BrowserWindow} from "electron"
import {ipcMainHandle, ipcMainOn, isDev} from "./util.js";
import {getUIPath} from "./pathResolver.js";
import {getStaticData, pollResources} from "./resourceManager.js";
import {getPreloadPath} from "./pathResolver.js";
import {createTray} from "./tray.js";
import {createMenu} from "./menu.js";
//import {ipcMain, webContents} from 'electron';


// type test = string; // to check running in javascript. javascript doesn't know what a type is so an error will be thrown

//create an Electron app that user can interact with. this file is added to package.json's main path. main.ts will run once the Electron starts
app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath(),
        },
        frame: false,
    })

    if(isDev()) {
        mainWindow.loadURL("http://localhost:5123");
    } else {
        //path.join does things like converting backslashes to forward slashes on Windows, also makes sure the path is correct for the operating system
        mainWindow.loadFile(getUIPath());
    }

    pollResources(mainWindow);

    ipcMainHandle("getStaticData", ()=>{
        return getStaticData();
    });

    ipcMainOn('sendFrameAction', (payload: FrameWindowAction) => {
        switch (payload) {
            case 'CLOSE':
                mainWindow.close();
                break;
            case 'MAXIMIZE':
                mainWindow.maximize();
                break;
            case 'MINIMIZE':
                mainWindow.minimize();
                break;
        }
    });

    // new Tray(path.join(getAssetPath(), process.platform === "win32" ? "trayIconTemplate.png" : "trayIcon.png"));
    createTray(mainWindow);
    createMenu(mainWindow);

    // handleGetStaticData(() => {
    //     return getStaticData();
    // });
    handleCloseEvents(mainWindow);
});

// function handleGetStaticData(callback: () => StaticData) {
//     // ipcMain.handle('getStaticData', callback); // this is not type safe
//     ipcHandle('getStaticData', callback); // this is type safe
// }
function handleCloseEvents(mainWindow: BrowserWindow) {

    let willClose = false;
    mainWindow.on("close", (e) => {
        if (willClose) {
            return;
        }

        e.preventDefault(); // prevent the default close behavior, which would quit the app
        mainWindow.hide(); // hide the window instead of closing it, so the app keeps running in the background and can be accessed from the system tray
        if (app.dock) { // if the app has a dock (eg: on macOS)
            app.dock.hide(); // hide the dock icon as well, to prevent confusion for users that might think the app is still open when it's actually hidden in the system tray

        }
    });

    app.on("before-quit", () => { // if close happens first and before quit happens after that, willClose= false
        willClose = true;
    })

    mainWindow.on("show", () => {
        willClose = false;
    })

}
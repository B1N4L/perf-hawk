import { BrowserWindow, Menu, Tray, app } from 'electron';
import { getAssetPath } from './pathResolver.js';
import path from 'path';

export function createTray(mainWindow: BrowserWindow) {
    //mainWindow.show();
    const tray = new Tray(
        path.join(
            getAssetPath(),
            process.platform === 'darwin' ? 'trayIconTemplate.png' : 'trayIcon.png'
        )
    );

    tray.setContextMenu(
        Menu.buildFromTemplate([
            {
                label: 'Show',
                click: () => {
                    mainWindow.show();
                    if (app.dock) { // for MacOS: if the app has a dock, show the dock icon as well when the user clicks "Show" from the tray menu, so they can easily access the app from the dock if they want to keep it open while working on other things.
                        app.dock.show();
                    }
                },
            },
            {
                label: 'Quit',
                click: () => app.quit(),
            },
        ])
    );
}
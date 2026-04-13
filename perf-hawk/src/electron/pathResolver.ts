import path from "path";
import {app} from "electron";
import {isDev} from "./util.js";

export function getUIPath():string {
    return path.join(app.getAppPath(), '/dist-react/index.html');
}

export function getAssetPath():string {
    return path.join(app.getAppPath(), isDev() ? '.' : '..', '/src/assets');
}

// TODO: add types later, adding them now is dangerous.
export function getPreloadPath(){
    return path.join(
        app.getAppPath(),
        isDev() ? "." : "..", // ".." is for leaving app.asar in production build by escaping from .asar format.
        "/dist-electron/preload.cjs"
    );
}
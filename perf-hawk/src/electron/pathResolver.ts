import path from "path";
import {app} from "electron";
import {isDev} from "./util.js";


// TODO: add types later, adding them now is dangerous.
export function getPreloadPath(){
    return path.join(
        app.getAppPath(),
        isDev() ? "." : "..", // ".." is for leaving app.asar in production build by escaping from .asar format.
        "/dist-electron/preload.cjs"
    );
}
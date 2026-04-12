import osUtils from "os-utils"
import fs from "fs"
import * as os from "node:os";
import {BrowserWindow} from "electron";
import {ipcWebContentsSend} from "./util.js";     //requires node 18 or later

const POLLING_INTERVAL = 500 //ms

//in an interval, poll the resources and send them to the main process
export function pollResources(mainWindow: BrowserWindow){
    setInterval( async () => {
        const cpuUsage = await getCpuUsage();
        const ramUsage = getRamUsage();
        const storageData = getStorageData();
        // console.log({cpuUsage, ramUsage, storageUsage: storageData.usage});
        // everything that Electron needs to interact with the actual window is inside the webContents
        // mainWindow.webContents.send("statistics", { //is not type safe
        ipcWebContentsSend("statistics", mainWindow.webContents, { // is type safe
            cpuUsage,
            ramUsage,
            storageUsage: storageData.usage
        });

    }, POLLING_INTERVAL);
}

export function getStaticData(){
    const totalStorage = getStorageData().total;
    const cpuModel = os.cpus()[0].model; //get the model of the first CPU core, which should be the same for all cores
    const totalMemGB = Math.floor(osUtils.totalmem() / 1024); //get total RAM in gigabytes

    return {
        totalStorage,
        cpuModel,
        totalMemGB,
    }
}

function getCpuUsage(): Promise<number> {
    //new way, uses promises instead of callbacks, which is more modern and easier to work with
    return new Promise((resolve) => {
        osUtils.cpuUsage(resolve);
    })
    //old way of doing it, but it was callback based and I wanted to use promises instead
    //osUtils.cpuUsage((percentage) => {console.log(percentage)});
}

function getRamUsage(){
    return 1- osUtils.freememPercentage(); //subtract by one to get used RAM
}

function getStorageData(){
    //gives stats about a specific region of our file system?
    const stats = fs.statfsSync(process.platform === "win32" ? "C://" : "/");
    const total = stats.bsize * stats.blocks;
    const free = stats.bsize * stats.bfree;

    return {
        total: Math.floor(total / 1_000_000_000), //get storage size down to gigabytes
        usage: 1 - free / total, //get used storage percentage
    }
}
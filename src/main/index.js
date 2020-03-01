"use strict";

import { app, BrowserWindow, ipcMain } from "electron";

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
    global.__static = require("path")
        .join(__dirname, "/static")
        .replace(/\\/g, "\\\\");
}

let mainWindow, drawWindow, lineWindow;
const winURL =
    process.env.NODE_ENV === "development"
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        width: 660,
        height: 500,
        useContentSize: true,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            devTools: process.env.NODE_ENV === "development"
        }
    });

    mainWindow.loadURL(winURL);

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});

/** 创建画图用的窗口 */
ipcMain.on("draw:open", (event, { info, path }) => {
    drawWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        show: false,
        width: 1000,
        height: 980,
        useContentSize: true,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            devTools: process.env.NODE_ENV === "development"
        }
    });

    drawWindow.loadURL(winURL + `#/canvas?info=${info}&path=${path}`);

    drawWindow.once("ready-to-show", () => {
        drawWindow.show();
    });

    drawWindow.on("closed", () => {
        drawWindow = null;
    });
});

ipcMain.on("draw:close", event => {
    drawWindow && drawWindow.close();
});

/** 创建画项目节点需要的窗口 */
ipcMain.on("line:open", (event, { info, path }) => {
    lineWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        show: false,
        width: 1000,
        height: 800,
        resizable: false,
        useContentSize: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            devTools: process.env.NODE_ENV === "development"
        }
    });

    lineWindow.loadURL(winURL + `#/line?info=${info}&path=${path}`);

    lineWindow.once("ready-to-show", () => {
        lineWindow.show();
    });

    lineWindow.on("closed", () => {
        lineWindow = null;
    });
});

ipcMain.on("line:close", event => {
    lineWindow && lineWindow.close();
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

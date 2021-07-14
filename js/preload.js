/*
 * preload.js
 */

const { app, contextBridge, ipcRenderer } = require("electron");

const {
  getCurrentWindow,
  openMenu,
  minimizeWindow,
  unmaximizeWindow,
  maxUnmaxWindow,
  isWindowMaximized,
  closeWindow,
} = require("./menu-functions");

//window.isElectron = true
//window.ipcRenderer = ipcRenderer

//app.on('ready', () => {
//

//window.ipcRenderer = require('electron').ipcRenderer;

  contextBridge.exposeInMainWorld("api", {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = ["toMain", "toPrefs"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ["fromMain", "fromPrefs"];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  });
//});

process.once('loaded', () => {

  window.getCurrentWindow = getCurrentWindow;
  window.openMenu = openMenu;
  window.minimizeWindow = minimizeWindow;
  window.unmaximizeWindow = unmaximizeWindow;
  window.maxUnmaxWindow = maxUnmaxWindow;
  window.isWindowMaximized = isWindowMaximized;
  window.closeWindow = closeWindow;

/*
  window.addEventListener('message', evt => {
    if (evt.data.type === 'select-dirs') {
      ipcRenderer.send('select-dirs')
    }
  });
*/

  window.addEventListener('DOMContentLoaded', () => {
    if(process.env.NODE_ENV == 'development') {
      // Code for Development Mode
      console.log("process.env.NODE_ENV =", process.env.NODE_ENV);
    }
    else {
      // Code for Testing Mode
      console.log("process.env.NODE_ENV =", process.env.NODE_ENV);
    }
  });
});


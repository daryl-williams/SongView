/*
 * preload.js
 */

const { contextBridge, ipcRenderer } = require("electron");

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

contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {

  window.getCurrentWindow = getCurrentWindow;
  window.openMenu = openMenu;
  window.minimizeWindow = minimizeWindow;
  window.unmaximizeWindow = unmaximizeWindow;
  window.maxUnmaxWindow = maxUnmaxWindow;
  window.isWindowMaximized = isWindowMaximized;
  window.closeWindow = closeWindow;

  if(process.env.NODE_ENV == 'development') {
    // Code for Development Mode
    console.log("process.env.NODE_ENV =", process.env.NODE_ENV);
  }
  else {
    // Code for Testing Mode
    console.log("process.env.NODE_ENV =", process.env.NODE_ENV);
  }

//  if (document.getElementById('song-collections') !== null) {
//    // Check to make sure we have at least one song collection.
//    // If it is not we set process.env.SONG_COLLECTION to an empty string
//    // which is used in main.js to determine whether to initialize a collection.
//    let number_of_collections = document.getElementById("song-collections").options.length;
//    if (number_of_collections === 0) {
//      process.env.SONG_COLLECTION = "";
//    }
//  }

});


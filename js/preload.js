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

process.once('loaded', () => {
  window.getCurrentWindow = getCurrentWindow;
  window.openMenu = openMenu;
  window.minimizeWindow = minimizeWindow;
  window.unmaximizeWindow = unmaximizeWindow;
  window.maxUnmaxWindow = maxUnmaxWindow;
  window.isWindowMaximized = isWindowMaximized;
  window.closeWindow = closeWindow;

//  ipcRenderer.on('port', (e) => {  // e.ports is a list of ports sent along with this message
//    console.log('songview:/js/preload.js:ipcRenderer.on(port):', e);
//    e.ports[0].onmessage('message', (messageEvent) => {
//      console.log(messageEvent.data)
//    })
//  })

//  ipcRenderer.send('sendProps', 'barish testing...');
//  ipcRenderer.send('reply', 'fooish testing...');

  contextBridge.exposeInMainWorld("api", {
    deliverPreferences: async (channel, data) => {
      console.log('songview:/js/preload.js:deliverPreferences(): deliverPreferences channel =', channel, ', data =', data);
      ipcRenderer.on(channel, (event, data) => {
        return data;
      });

//      let validChannels = ["fromSongView"];
//      if (validChannels.includes(channel)) {
        console.log('songview:/js/preload.js:deliverPreferences(): deliverPreferences VALID API, data =', data);
//        return ipcRenderer.invoke('deliverPreferences', data);
        //ipcMain.send(data);
        //event.sender.send(data);
//      } else {
//        console.log('songview:/js/preload.js:deliverPreferences(): invalid channel =', channel);
//      }
    },
    send: (channel, data) => {
        console.log('songview:/js/preload.js:send(): <><><> SEND channel =', channel);
      // Whitelist channels.
      let validChannels = ["toMain", "deliverPreferences", "sendPreferences", "fromMain"];
      if (validChannels.includes(channel)) {
        console.log('songview:/js/preload.js:send(): VALID channel =', channel);
        console.log('songview:/js/preload.js:send(): DATA =', data);
        ipcRenderer.send(channel, data);
      } else {
        console.log('songview:/js/preload.js:send(): invalid channel =', channel);
      }
    },
    receive: (channel, func) => {
      let validChannels = ["deliverPreferences", "fromMain", "fromPrefs"];
      if (validChannels.includes(channel)) {
        console.log('songview:/js/preload.js:receive(): VALID channel =', channel);
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
        console.log('songview:/js/preload.js:receive(): SEND data =', channel);
      }
      else {
        console.log('songview:/js/preload.js:receive(): invalid channel =', channel);
      }
    }
  });

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


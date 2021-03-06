/*
 * File: preferences.js
 * SongView Electron Application
 *
 * File: preferences.js
 * Author: Daryl Williams
 * Copyright (c) 2021 Daryl Williams
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { session, ipcRenderer, ipcMain, BrowserWindow, app, screen, dialog } = require('electron');
const Store = require('./store.js');
const store = new Store();
const MainWindow = require('os');

//console.log('songview:/js/preferences.js: ipcMain =', ipcMain)

let preferences = {
  lmsRoot: "",
  Browser: "",
  Displays: [
    { "default":"Display #1"}
  ],
  Collections: [],
  WindowLocation: [],

  show: function value(arg) {
    console.log('songview:/js/preferences.js:show(arg) =', arg);
  },
  value: function value(arg) {
    console.log('songview:/js/preferences.js:value(arg) =', arg);
  }
};

let preferencesWindow;
let appname = app.getName().toLowerCase();
let preferencesData;
let songlist;
//let preferenceFileExists = false;

let browser;
let preferencesFile = 'preferences.json';

// 
let get_default_browser = process.cwd() + '/get-default-browser.sh';
console.log('songview:/js/preferences.js: COMMAND =', get_default_browser);

// Determine the location of our preferences file and default browser.
if (process.platform === 'darwin') {
  preferencesFile = app.getPath('home') + '/.config/' + appname + '/' + preferencesFile;
  // Get MacOS default browser.
  try {
    //const cmd = 'git rev-parse --is-inside-work-tree';
    browser = path.resolve('/Applications', 'Safari\.app');

    // Run the get-default-browser.sh command.
    browser = execSync(get_default_browser).toString();

    //console.log('songview:/js/preferences.js: System Default Browser =', browser);
    let browser_name = browser.substring(7, browser.lastIndexOf('.'));
    browser_name = browser_name.substring(browser_name.lastIndexOf('/')+1).toLowerCase();
    //console.log('songview:/js/preferences.js: BROWSER_NAME =', browser_name);

    let mozbin  = browser.substring(7, browser.length-2) + '/Contents/MacOS/Contents/MacOS/' + browser_name;
    //console.log('songview:/js/preferences.js: MOZBIN =', mozbin);
    browser = mozbin;
    //console.log('songview:/js/preferences.js: System Default Browser =', browser);
  } catch (error) {
    console.log(`songview:/js/preferences.js: ERROR: Status Code: ${error.status} with ${error.message}`);
  }
  console.log('songview:/js/preferences.js: System Default Browser =', browser);
}
else if (process.platform === 'linux') {
  browser = '/usr/bin/firefox';
  browser = path.resolve('/usr/bin', 'firefox');
  preferencesFile = app.getPath('home') + '/.config/' + appname + '/' + preferencesFile;
}
else {
  // What do we do for Windows???
  browser = path.resolve('C:\\Program Files\\', 'edge');
  preferencesFile += app.getPath('userData');
}

//console.log('songview:/js/preferences.js: preferencesFile = >' + preferencesFile + '<');
//console.log('songview:/js/preferences.js: 222 BROWSER = >' + browser + '<');

// Get our display information.
const displays = screen.getAllDisplays()
//console.log('songview:/js/preferences.js: DISPLAYS =', displays);

let display_list = [];
for (let i=0, len=displays.length; i<len; i++) {
  let ndx = i + 1;
  //let parms = '{"label": "Display #' + ndx + '", "value": "width ' + displays[i].bounds.width + ', height: ' + displays[i].bounds.height + '"}';
  let parms = '{"label": "Display #' + ndx + '", "value": "width ' + displays[i].bounds.width + ', height: ' + displays[i].bounds.height + '"}';
  //console.log('songview:/js/preferences.js: PARMS =', parms);
  let json = JSON.parse(parms);
  //console.log('songview:/js/preferences.js: JSON =', json);
  display_list.push(json);
}
//console.log('songview:/js/preferences.js: DISPLAY_LIST =', display_list);

// Add display info to our preferences object.
preferences.Displays = display_list;
//console.log('songview:/js/preferences.js: MONITORS =', preferences.Displays);

// Define screen coordinates.
let screen_dimensions = display_list[0].value;
//console.log('songview:/js/preferences.js: screen_dimensions =', screen_dimensions);
let screen_width, screen_height;
[screen_width, screen_height] = screen_dimensions.split(/,/);
screen_width = parseInt(screen_width.replace('width ',  ''), 10);
screen_height = parseInt(screen_height.replace('height: ',  ''), 10);
//console.log('songview:/js/preferences.js: screen_width =', screen_width);
//console.log('songview:/js/preferences.js: screen_height =', screen_height);

let half_width = screen_width/2;
let half_height = screen_height/2;
//console.log('songview:/js/preferences.js: half_width =', half_width);
//console.log('songview:/js/preferences.js: half_height =', half_height);

let default_window_width = 1024, default_window_height = 600;
let half_window_width = default_window_width/2;
let half_window_height = default_window_height/2;

let default_window_x = half_width;
let default_window_y = half_height;

preferences.WindowLocation[0] = default_window_x;
preferences.WindowLocation[1] = default_window_y;

let res = fs.existsSync(preferencesFile);
if (res === false) {
  // The file does not exists so we will display the Preferences window
  // to enable the user to define their application preferences.
  console.log('songview:/js/preferences.js: >>>> PREFERENCES FILE DOES NOT EXIST =', res);

  preferenceFileExists = false;

  let updatePreferencesFile = (newPreferences) => {
    console.log('songview:/js/preferences.js:updatePreferencesFile(): preferencesFile =', preferencesFile, ', preferences =', preferences);

    fs.writeFileSync(preferencesFile, JSON.stringify(preferences));
    console.log('songview:/js/preferences.js:updatePreferencesFile(): wrote collections to preferencesFile =', preferencesFile);

    preference_data = JSON.parse(fs.readFileSync(preferencesFile));
    console.log('songview:/js/preferences.js:updatePreferencesFile(): preference_data =', preference_data)
  }

  let default_window_width = 800, default_window_height = 600;
  // Create the application main window.
  preferencesWindow = new BrowserWindow({
    parent: 'top',
    modal: true,
    show: true,
    title: 'Preferences',
    width: default_window_width,
    height: default_window_height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    frame: true
  })
  console.log('songview:/js/preferences.js: CREATED PREFERENCES WINDOW =', preferencesWindow);
  preferencesWindow.loadFile('preferences.html');
  //preferencesWindow.webContents.openDevTools(); // Developer Tools

  preferencesWindow.once('ready-to-show', () => {
    preferencesWindow.show()
    console.log('songview:/js/preferences.js: SHOWING PREFERENCES WINDOW =', preferencesWindow);
  });

  let updateFolderSelectStatus = () => {
    console.log('songview:/js/preferences.js: updateFolderSelectStatus(): ');

    // Update the file-select-status DOM element.
    // by sending IPC to the render process to update 
    // the stautus element.
//    ipcMain.on('toPrefs', 'dom-update:file-select-status');

  }

  let openFolderDialog = (dialog_title, dialog_message, dialog_property_type, preference_key) => {
    console.log('songview:/js/preferences.js:openFolderDialog(): >>> OPEN FOLDER DIALOG, title   =', dialog_title);
    console.log('songview:/js/preferences.js:openFolderDialog(): >>> OPEN FOLDER DIALOG, message =', dialog_message);
    console.log('songview:/js/preferences.js:openFolderDialog(): >>> OPEN FOLDER DIALOG, type    = ', dialog_property_type);
    console.log('songview:/js/preferences.js:openFolderDialog(): >>> OPEN FOLDER DIALOG, key   =', preference_key);

    dialog.showOpenDialog(preferencesWindow, {
      title: dialog_title,
      message: dialog_message,
      properties: [dialog_property_type]
    }).then(result => {
      console.log('songview:/js/preferences.js:openFolderDialog():dialog.showOpenDialog(): RESULT=', result)
      console.log('songview:/js/preferences.js:openFolderDialog():dialog.showOpenDialog(): Folder Path = ', result.filePaths[0])
      if (result.canceled) {
        // The Cancel button has been pressed.
        try {
          console.log('songview:/js/preferences.js:openFolderDialog():dialog.showOpenDialog(): CANCELED: ', result.filePaths)
          //app.exit(1);
        }
        catch(error) {
          console.log('songview:/js/preferences.js:openFolderDialog():dialog.showOpenDialog(): select-lmsroot-directory CANCELED error =', error);
        };
      }
      else {
        // We now have the SELECTED FOLDER.
console.log('songview:/js/preferences.js:openFolderDialog():dialog.showOpenDialog(): >>> SELECTED FOLDER =', result.filePaths[0]);
console.log('songview:/js/preferences.js:openFolderDialog():dialog.showOpenDialog(): >>> KEY =', preference_key);

        let folderObj;
//        if (preference_key === 'lmsRoot') {
          const folderStr = "{\"" + preference_key + "\": " + JSON.stringify(result.filePaths) + "}";
          folderObj = JSON.parse(folderStr);
          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> folderStr =', folderStr);
          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> folderObj =', folderObj);
          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> folderFieldLabel =', preference_key);
          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> UPDATE FIELD =', preference_key);
//          preferences['lmsRoot'] = folderObj['preference_key'];

          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> OLD preferences =', preferences);

          preferences[preference_key] = folderObj[preference_key];
          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> NEW preferences =', preferences);

        if (preferences.Collections.length) {
          const folderStr = "{\"" + preference_key + "\": " + JSON.stringify(result.filePaths) + "}";
          console.log('songview:/js/preferences.js: >>> FOLDER_STR =', folderStr);

          const dirTree = require("directory-tree");
          songlist = dirTree(preferences.Collections[0]);
          //console.log('songview:/js/preferences.js: SONGLIST =', songlist)
          preferences.SongList = songlist;
          console.log('songview:/js/preferences.js: GOT SONGLIST, length =', preferences.SongList.length);

          folderObj = JSON.parse(folderStr);
          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> folderStr =', folderStr);
          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> folderObj =', folderObj);
          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> folderFieldLabel =', preference_key);
          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> ADD FIELD =', preference_key);
//          preferences['Collections'] = folderObj[preference_key];
          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> NEW preferences =', preferences);
        }


//        }
//        else if (preference_key === 'collections') {
//          const folderStr = "{\"" + preference_key + "\": " + JSON.stringify(result.filePaths) + "}";
//          folderObj = JSON.parse(folderStr);
//          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> folderStr =', folderStr);
//          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> folderObj =', folderObj);
//          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> folderFieldLabel =', preference_key);
//          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> ADD FIELD =', preference_key);
//          preferences['Collections'] = folderObj[preference_key];
//          console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> NEW preferences =', preferences);
//        }
//        else {
//          console.log('songview:/js/preferences.js:openFolderDialog():dialog.showOpenDialog(): error: unknown preference_key =', preference_key);
//        }

        //preferences.lmsRoot = folderObj.lmsRoot;

        // Now write our preferences to disk.
        updatePreferencesFile(folderObj);

        //updateFolderSelectStatus();
        preferencesWindow.webContents.send('dom-update:file-select-status', result.filePaths[0]);
console.log('songview:/js/preferences.js:createWindow(): SENT UPDATE REQUEST = dom-update:file-select-status');
      }
    }).catch(error => {
      console.log('songview:/js/preferences.js:dialog.showOpenDialog(): SELECT FOLDER error =', error)
      app.exit(1);
    });
  };

  ipcMain.on("savePreferences", (event) => {
    console.log('songview:/js/preferences.js:ipcMain.on(savePreferences): >>> savePreferences PREFERENCES =', typeof preferences);
    //console.log('songview:/js/preferences.js:ipcMain.on(savePreferences): >>> savePreferences EVENT =', event);
/*
    process.env.PATH = preferences.lmsRoot + '/bin';
    process.env.BROWSER_PATH = preferences.Browser;
    //process.env.Displays = preferences.Display.default;

    console.log('songview:/js/preferences.js:ipcMain.on(savePreferences): >>> savePreferences PATH =', process.env.PATH);
    console.log('songview:/js/preferences.js:ipcMain.on(savePreferences): >>> savePreferences BROWSER_PATH =', process.env.BROWSER_PATH);
    //console.log('songview:/js/preferences.js:ipcMain.on(savePreferences): >>> savePreferences MAIN_WINDOW =', MainWindow);

    event.returnValue = JSON.stringify(preferences);
    
    preferences.prefWin = preferencesWindow;

    MainWindow.webContents.send('preferenceDelivery', JSON.stringify(preferences));
*/
    preferencesWindow.close();

    return;
  });

  ipcMain.on("getPreferences", (event, request) => {
    console.log('songview:/js/preferences.js:ipcMain.on(getPreferences): getPreferences REQUEST =', request);
    console.log('songview:/js/preferences.js:ipcMain.on(getPreferences): PREFERENCES =', preferences);
    event.returnValue = JSON.stringify(preferences);
  });

  ipcMain.on("updatePreferences", (event, request, value) => {
    // We update the preferences object variable here,
    // writing to the preferences file happens in the local
    // updatePreferences() function.
    console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): >>> VALUE =', value);
    if (request === 'display') {
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): DISPLAY REQUEST =', request);
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): DISPLAY BEFORE =', preferences.Displays);
      preferences.Displays.push({"default": value});
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): DISPLAY AFTER =', preferences);
      // Now write our preferences to disk.
      updatePreferencesFile(preferences);
    }
    else if (request === 'window-coordinates') {
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): REQUEST =', request);
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): BEFORE PREFERENCES =', preferences);
      preferences.WindowLocation = value;
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): AFTER PREFERENCES =', preferences);
      updatePreferencesFile(preferences);
    }
    else {
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): UNKNOWN renderer REQUEST =', request);
    }
  });

  ipcMain.on("sendPreferences", (event, data) => {
    console.log('songview:/js/preferences.js:ipcMain.on(toPrefs): >>> sendPreferences DATA =', data);
  });

  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log('songview:/js/preferences.js:ipcMain.on(toPrefs): >>> ASYNC MSG =', arg);
    event.returnValue = 'pong'
  })

  ipcMain.on("displayFolderDialog", (event, dialog_title, dialog_message, dialog_property_type, preference_key) => {
    console.log('songview:/js/preferences.js:ipcMain.on(toPrefs): >>> dialog_title =', dialog_title);
    console.log('songview:/js/preferences.js:ipcMain.on(toPrefs): >>> dialog_message  =', dialog_message);
    console.log('songview:/js/preferences.js:ipcMain.on(toPrefs): >>> dialog_property_type  =', dialog_property_type);
    console.log('songview:/js/preferences.js:ipcMain.on(toPrefs): >>> preference_key =', preference_key);

    openFolderDialog(dialog_title, dialog_message, dialog_property_type, preference_key, ipcMain);
  });
}
else {
  // The preference file exists.
  console.log('songview:/js/preferences.js: The Preferences File Exists =', res);

  preferenceFileExists = true;
//  console.log('songview:/js/preferences.js: >>> BROWSER =', browser);

//  ipcMain.on('browserReady', (event, data) => {
//console.log('songview:/js/preferences.js:clientReady(): CLIENT READY <<<>>> DATA =', data)
//console.log('songview:/js/preferences.js:clientReady(): CLIENT READY <<<>>> sendProps =', preferences)
//    event.reply('browserReady', preferences);
//  });

  // The file exists.
  //preferenceData = JSON.parse(fs.readFileSync(preferencesFile));
  //preferences = preferenceData;

  preferences = JSON.parse(fs.readFileSync(preferencesFile));
  console.log('songview:/js/preferences.js: USING preferences =', preferences);

console.log('songview:/js/preferences.js: COLLECTIONS LENGTH =', preferences.Collections.length);

  // If there are prefered/saved attributes capture them here.
  if (typeof preferences !== 'undefined' && preferences.Collections.length > 0) {
    // Add SongList to preferences.
    console.log('songview:/js/preferences.js: FOUND COLLECTIONS =', preferences.Collections);
    const dirTree = require("directory-tree");
    songlist = dirTree(preferences.Collections[0]);
    //console.log('songview:/js/preferences.js: SONGLIST =', songlist)
    console.log('songview:/js/preferences.js: PREFS =', preferences)
    preferences.SongList = songlist;
    console.log('songview:/js/preferences.js: GOT SONGLIST, length =', preferences.SongList.children.length);
  }

  if (preferences.windowBounds !== undefined) {
    default_window_width = preferences.windowBounds.width;
    default_window_height = preferences.windowBounds.height;
    console.log('songview:/js/preferences.js:createWindow(): Window location X =', default_window_width);
    console.log('songview:/js/preferences.js:createWindow(): Window location Y =', default_window_height);
  }
}

module.exports = preferences;


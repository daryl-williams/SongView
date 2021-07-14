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
const { session, ipcMain, BrowserWindow, app, screen, dialog } = require('electron');
const Store = require('./store.js');
const store = new Store();

//console.log('songview:/js/preferences.js: ipcMain =', ipcMain)

let preferences = {
  lmsRoot: "",
  Browser: "",
  Displays: [],
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

  let updatePreferences = (newPreferences) => {
    console.log('songview:/js/preferences.js:uupdatePreferencespdatePreferences(): preferencesFile =', preferencesFile, ', preferences =', preferences);

    fs.writeFileSync(preferencesFile, JSON.stringify(preferences));
    console.log('songview:/js/preferences.js:updatePreferences(): wrote collections to preferencesFile =', preferencesFile);

    preference_data = JSON.parse(fs.readFileSync(preferencesFile));
    console.log('songview:/js/preferences.js:updatePreferences(): preference_data =', preference_data)
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
  preferencesWindow.webContents.openDevTools(); // Developer Tools

  preferencesWindow.once('ready-to-show', () => {
    preferencesWindow.show()
    console.log('songview:/js/preferences.js: SHOWING PREFERENCES WINDOW =', preferencesWindow);
  });

  let updateFolderSelectStatus = () => {
    console.log('songview:/js/preferences.js: updateFolderSelectStatus(): ');

    // Update the file-select-status DOM element.
    // by sending IPC to the render process to update 
    // the stautus element.
    ipcMain.on('toPrefs', 'dom-update:file-select-status');

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
        updatePreferences(folderObj);

        //updateFolderSelectStatus();
        preferencesWindow.webContents.send('dom-update:file-select-status', result.filePaths[0]);
console.log('songview:/js/preferences.js:createWindow(): SENT UPDATE REQUEST = dom-update:file-select-status');
      }
    }).catch(error => {
      console.log('songview:/js/preferences.js:dialog.showOpenDialog(): SELECT FOLDER error =', error)
      app.exit(1);
    });
  };

  ipcMain.on("savePreferences", (event, new_preferences) => {
    console.log('songview:/js/preferences.js:ipcMain.on(savePreferences): savePreferences PREFERENCES =', new_preferences);
    event.returnValue = JSON.stringify(new_preferences);
    preferencesWindow.close();
    return;
  });

  ipcMain.on("getPreferences", (event, request) => {
    console.log('songview:/js/preferences.js:ipcMain.on(getPreferences): REQUEST =', request);
    console.log('songview:/js/preferences.js:ipcMain.on(getPreferences): PREFERENCES =', preferences);
    event.returnValue = JSON.stringify(preferences);
  });

  ipcMain.on("updatePreferences", (event, request, value) => {
    // We update the preferences object variable here,
    // writing to the preferences file happens in the local
    // updatePreferences() function.
    console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): >>> VALUE =', value);
    if (request === 'display') {
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): REQUEST =', request);
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): BEFORE =', preferences.Displays);
      preferences.Displays.push({"default": value});
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): AFTER =', preferences);
      // Now write our preferences to disk.
      updatePreferences(preferences);
    }
    else if (request === 'window-coordinates') {
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): REQUEST =', request);
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): BEFORE PREFERENCES =', preferences);
      preferences.WindowLocation = value;
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): AFTER PREFERENCES =', preferences);
      updatePreferences(preferences);
    }
    else {
      console.log('songview:/js/preferences.js:ipcMain.on(updatePreferences): UNKNOWN renderer REQUEST =', request);
    }
  });

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

//  preferenceFileExists = true;
//  console.log('songview:/js/preferences.js: >>> BROWSER =', browser);

  // The file exists.
  preferenceData = JSON.parse(fs.readFileSync(preferencesFile));
  console.log('songview:/js/preferences.js: FOUND preferenceData =', preferenceData);

  preferences = preferenceData;

//console.log('songview:/js/preferences.js: COLLECTIONS LENGTH =', preferenceData.collections.length);
console.log('songview:/js/preferences.js: preferenceData =', preferenceData);

  // If there are prefered/saved attributes capture them here.
  if (preferenceData && preferenceData.Collections.length > 0) {
    console.log('songview:/js/preferences.js: FOUND COLLECTIONS =', preferenceData.Collections);
    const dirTree = require("directory-tree");
    songlist = dirTree(preferenceData.Collections[0]);
    //console.log('songview:/js/preferences.js: SONGLIST =', songlist)
    console.log('songview:/js/preferences.js: GOT SONGLIST!');
    preferences.SongList = songlist;
  }

/*
  else {
    // We neeed to set our user preferences.
    //console.log('songview:/js/preferences.js: NEED PREFERENCES DIALOG.');
//    preferences.show();
//    ipcRenderer.send('synchronous-message', 'edit-preferences')
  }
*/

  if (preferenceData.windowBounds !== undefined) {
    default_window_width = preferenceData.windowBounds.width;
    default_window_height = preferenceData.windowBounds.height;
    console.log('songview:/js/preferences.js:createWindow(): Window location X =', default_window_width);
    console.log('songview:/js/preferences.js:createWindow(): Window location Y =', default_window_height);
  }

  //window.api.send("toMain", "savePreferences: " + preferences);

  //const myPref = preferences.value('songlist');
  //console.log('songview:/js/preferences.js: xxxDATA_STORE =', myPref);
}

module.exports = preferences;


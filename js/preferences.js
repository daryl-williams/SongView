/*
 * /js/preferences.js
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { session, ipcMain, BrowserWindow, app, screen, dialog } = require('electron');

let preferencesWindow;
let appname = app.getName().toLowerCase();
let preferencesData;
let songlist;
let preferenceFileExists = false;

let browser;
let preferencesFile = 'preferences.json';

let cmd = process.cwd() + '/get-default-browser.sh';
console.log('songview:/js/preferences.js: COMMAND =', cmd);
console.log('songview:/js/preferences.js: CWD =', process.cwd());

// Determine the location of our preferences file and default browser.
if (process.platform === 'darwin') {
  preferencesFile = app.getPath('home') + '/.config/' + appname + '/' + preferencesFile;
  // Get MacOS default browser.
  try {
    //const cmd = 'git rev-parse --is-inside-work-tree';
    browser = path.resolve('/Applications', 'Safari\.app');
    browser = execSync(cmd).toString();
    console.log('songview:/js/preferences.js: INITIAL BROWSER =', browser);

    let browser_name = browser.substring(7, browser.lastIndexOf('.'));
    browser_name = browser_name.substring(browser_name.lastIndexOf('/')+1).toLowerCase();
    console.log('songview:/js/preferences.js: BROWSER_NAME =', browser_name);
    let moz  = browser.substring(7, browser.length-2) + '/Contents/MacOS/Contents/MacOS/' + browser_name;
    console.log('songview:/js/preferences.js: MOZ =', moz);
    browser = moz;
    console.log('songview:/js/preferences.js: FINAL BROWSER =', browser);
  } catch (error) {
    console.log(`songview:/js/preferences.js: ERROR: Status Code: ${error.status} with ${error.message}`);
  }
  console.log('songview:/js/preferences.js: ->>> BROWSER =', browser);
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
console.log('songview:/js/preferences.js: 222 BROWSER = >' + browser + '<');

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

/**
preferences = new ElectronPreferences({
   * Where should preferences be saved?
   * 'dataStore': path.resolve(app.getPath('userData'), 'preferences.json'),
  "dataStore": preferencesFile,
  "defaults": {
    "displays": [],
    "collections": {
      "folder": "",
    },
    "lms_root": {
      "folder": "",
    },
    "browser": {
      "file_select": browser.trim(),
    },
    "songlist": [],
  },
  "sections": [
    {
      "id": "browser",
      "label": "Browser",
       "icon": "world",
       "form": {
         "groups": [
	  {
	  "label": "Browser",
            "fields": [
              {
                "label": "Select Browser",
                "key": "file",
                "type": "file_select",
                "help": "Select the browser used to display the songs"
              }
	    ]
          }
        ]
      }
    },
    {
      "id": "lms_root",
      "label": "LMS_ROOT",
       "icon": "folder-15",
       "form": {
         "groups": [
	  {
	  "label": "LMS Binaries",
            "fields": [
              {
                "label": "LMS Binaries",
                "key": "folder",
                "type": "directory",
                "help": "Where are the LMS binary applications?"
              }
	    ]
          }
        ]
      }
    },
    {
      "id": "collections",
      "label": "Song Collections",
       "icon": "folder-15",
       "form": {
         "groups": [
	  {
	  "label": "Collections",
            "fields": [
              {
                "label": "Select Song Collection(s)",
                "key": "folder",
                "type": "directory",
                "properties": "multiSelections",
                "help": "Pick one or more folders containing your songs"
              }
	    ]
          }
        ]
      }
    },
    {
      "id": "displays",
      "label": "Displays",
       "icon": "image",
       "form": {
         "groups": [
	  {
	  "label": "Displays",
            "fields": [
              {
                "label": "Select Song Display Monitor",
                "key": "song-display",
                "type": "radio",
                "options": display_list,
                "help": "Select the monitor to use for displaying the application"
              },
              {
                "label": "Select Song Display Monitor",
                "key": "application-display",
                "type": "radio",
                "options": display_list,
                "help": "Select the monitor to use for displaying the application"
              }
	    ]
          }
        ]
      }
    },
  ],
});
*/

let res = fs.existsSync(preferencesFile);
if (res === false) {
  // The file does not exists.
  console.log('songview:/js/preferences.js: >>>> PREFERENCES FILE DOES NOT EXIST =', res);

  preferenceFileExists = false;

  // Bring p the preferences editor.
//window.api.send("toMain", "hideMainWindow");
//  ipc.send('toMain', 'hideMainWindow');
//  preferences.show();

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
  console.log('songview:/js/preferences.js: DISPLAYING PREFERENCES WINDOW =', preferencesWindow);

  preferencesWindow.loadFile('preferences.html');
  preferencesWindow.webContents.openDevTools(); // Developer Tools

  preferencesWindow.once('ready-to-show', () => {
    preferencesWindow.show()
    console.log('songview:/js/preferences.js: SHOWING PREFERENCES WINDOW =', preferencesWindow);
  });

  ipcMain.on("toPrefs", (event, request, args) => {
    if (request === 'display-preference-dialog') {
      // The file does not exists, so open a dialog window to select song collection directory.
      dialog.showOpenDialog(mainWindow, {
        title: 'Preferences',
        message: 'Please select at least one SONG COLLECTION',
        properties: ['openDirectory', 'multiSelections']
      }).then(result => {
        console.log('songview:/js/preferences.js: RESULT =', result)
        if (result.canceled) {
          // The Cancel button has been pressed.
          try {
            console.log('songview:/js/preferences.js:dialog.showOpenDialog(): CANCELED: ', result.filePaths)
            //app.exit(1);
          }
          catch(error) {
            console.log('songview:/js/preferences.js:dialog.showOpenDialog(): display-preference-dialog, NOT CANCELED error =', error);
          };
        }
        else {
          // Action has not been canceled, continue...
//          collections = result.filePaths;
console.log('songview:/js/preferences.js:dialog.showOpenDialog(): RESULT =', result);
          const jsonstr = "{\"collections\": " + JSON.stringify(result.filePaths) + "}";
          const jsonobj = JSON.parse(jsonstr);

          // Now write our preferences to disk.
          fs.writeFileSync(preferences_file, JSON.stringify(jsonobj));
console.log('songview:/js/preferences.js:dialog.showOpenDialog(): WROTE COLLECTIONS to PREFERENCES=', preferences_file);
          preference_data = JSON.parse(fs.readFileSync(preferences_file));
console.log('songview:/js/preferences.js:createWindow(): preference_data =', preference_data)
        }
      }).catch(error => {
        console.log('songview:/js/preferences.js:dialog.showOpenDialog(): display-preference-dialog error =', error)
        app.exit(1);
      });
    }
    else if (request === 'select-lmsroot-directory') {
      console.log('songview:/js/preferences.js: >>> SELECT-LMSROOT-DIRECTORY, ARGS =', args);
      dialog.showOpenDialog(preferencesWindow, {
        properties: ['openDirectory'],
        title: 'LMS Root',
        message: 'Please select the LMS Root Folder',
        properties: ['openDirectory']
      }).then(result => {
        console.log('songview:/js/preferences.js: @@@ select-lmsroot-directory RESULT: ', result)
        console.log('songview:/js/preferences.js: @@@ LMS_ROOT: ', result.filePaths[0])
        if (result.canceled) {
          // The Cancel button has been pressed.
          try {
            console.log('songview:/js/preferences.js:dialog.showOpenDialog(): CANCELED: ', result.filePaths)
            //app.exit(1);
          }
          catch(error) {
            console.log('songview:/js/preferences.js:dialog.showOpenDialog(): select-lmsroot-directory CANCELED error =', error);
          };
        }
        else {
          // We now have the LMS_ROOT.
console.log('songview:/js/preferences.js:dialog.showOpenDialog(): !>>> LMS_ROOT =', result.filePaths[0]);
          const jsonstr = "{\"lmsRoot\": " + JSON.stringify(result.filePaths) + "}";
          const jsonobj = JSON.parse(jsonstr);
console.log('songview:/js/preferences.js:dialog.showOpenDialog(): >>> jsonSTR =', jsonstr);

          // Now write our preferences to disk.
          fs.writeFileSync(preferences_file, JSON.stringify(jsonobj));
console.log('songview:/js/preferences.js:dialog.showOpenDialog(): WROTE COLLECTIONS to PREFERENCES=', preferences_file);
          preference_data = JSON.parse(fs.readFileSync(preferences_file));
console.log('songview:/js/preferences.js:createWindow(): preference_data =', preference_data)
        }
      }).catch(error => {
        console.log('songview:/js/preferences.js:dialog.showOpenDialog(): select LMS_ROOT error =', error)
        app.exit(1);
      });
    }
    else {
      console.log('songview:/js/preferences.js:ipcMain.on(toPrefs): UNKNOWN renderer REQUEST =', request);
    }
  });
}
else {
  //console.log('songview:/js/preferences.js: PREFERENCES FILE DOES EXIST =', res);
  //console.log('songview:/js/preferences.js: >>> PREFERENCES =', preferences);

  preferenceFileExists = true;

  console.log('songview:/js/preferences.js: >>> BROWSER =', browser);

  // The file exists.
  preferenceData = JSON.parse(fs.readFileSync(preferencesFile));
  //console.log('songview:/js/preferences.js: FOUND preferenceData =', preferenceData);
  //console.log('songview:/js/preferences.js: COLLECTIONS =', preferenceData.collections);

//console.log('songview:/js/preferences.js: COLLECTIONS LENGTH =', preferenceData.collections.length);

  // If there are prefered/saved attributes capture them here.
  if (preferenceData && preferenceData.collections.length > 0) {
//console.log('songview:/js/preferences.js: FOUND COLLECTIONS =', collections);
    const dirTree = require("directory-tree");
    songlist = dirTree(preferenceData.collections[0]);
    //console.log('songview:/js/preferences.js: SONGLIST =', songlist)
    console.log('songview:/js/preferences.js: GOT SONGLIST!');
  }
  else {
    // We neeed to set our user preferences.
    //console.log('songview:/js/preferences.js: NEED PREFERENCES DIALOG.');
//    preferences.show();
//    ipcRenderer.send('synchronous-message', 'edit-preferences')
  }

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

preferences = {
  lmsRoot: "",
  Browser: "",
  Displays: [],
  Collections: [],

  show: function value(arg) {
    console.log('songview:/js/preferences.js:show(arg) =', arg);
  },
  value: function value(arg) {
    console.log('songview:/js/preferences.js:value(arg) =', arg);
  }
};

module.exports = preferences;


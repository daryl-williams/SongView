/*
 * /js/preferences.js
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { app, screen } = require('electron');
const ElectronPreferences = require('electron-preferences');

//const electron = require('electron');
//const ipc = electron.ipcRenderer;
//const { ipcRenderer } = require('electron');
//console.log('songview:/js/preferences.js: ipcRenderer =', ipcRenderer);

//let userData;
//let appname = app.getName().toLowerCase();

let appname = app.getName().toLowerCase();
let preferencesData;
let songlist;
let preferences = {};
let preferenceFileExists = false;

console.log('songview:/js/preferences.js: default userData =', app.getPath('userData'));
console.log('songview:/js/preferences.js: process.platform =', process.platform);

let preferencesFile = 'preferences.json';
// Determine the location of our preferences file.
if (process.platform === 'darwin' || process.platform === 'linux') {
  preferencesFile = app.getPath('home') + '/.config/' + appname + '/' + preferencesFile;
}
else {
  // What do we do for Windows???
  preferencesFile += app.getPath('userData');
}
console.log('songview:/js/preferences.js: preferencesFile =', preferencesFile);

// Get our display information.
const displays = screen.getAllDisplays()
console.log('songview:/js/preferences.js: DISPLAYS =', displays);

//const externalDisplay = displays.find((display) => {
//  console.log('songview:/js/preferences.js: ____DISPLAY =', display);
//  return display.bounds.x !== 0 || display.bounds.y !== 0
//  //return display.bounds;
//})
//console.log('songview:/js/preferences.js: EXTERNAL DISPLAY =', externalDisplay);

let display_list = [];
for (let i=0, len=displays.length; i<len; i++) {
  let ndx = i + 1;
  //let parms = '{"label": "Display #' + ndx + '", "value": "width ' + displays[i].bounds.width + ', height: ' + displays[i].bounds.height + '"}';
  let parms = '{"label": "Display #' + ndx + '", "value": "width ' + displays[i].bounds.width + ', height: ' + displays[i].bounds.height + '"}';
  console.log('songview:/js/preferences.js: PARMS =', parms);
  let json = JSON.parse(parms);
  console.log('songview:/js/preferences.js: JSON =', json);
  display_list.push(json);
}
console.log('songview:/js/preferences.js: DISPLAY_LIST =', display_list);


preferences = new ElectronPreferences({
  /**
   * Where should preferences be saved?
   * 'dataStore': path.resolve(app.getPath('userData'), 'preferences.json'),
   */
  'dataStore': preferencesFile,
  'defaults': {
    'displays': [],
    'collections': {
      'folder': '',
    },
    'lms_root': {
      'folder': '',
    },
    'songlist': [],
  },
  'sections': [
    {
      'id': 'lms_root',
      'label': 'LMS_ROOT',
       'icon': 'folder-15',
       'form': {
         'groups': [
	  {
	  'label': 'LMS Binaries',
            'fields': [
              {
                'label': 'LMS Binaries',
                'key': 'folder',
                'type': 'directory',
                'help': 'Where are the LMS binary applications?'
              }
	    ]
          }
        ]
      }
    },
    {
      'id': 'collections',
      'label': 'Song Collections',
       'icon': 'folder-15',
       'form': {
         'groups': [
	  {
	  'label': 'Collections',
            'fields': [
              {
                'label': 'Select Song Collection(s)',
                'key': 'folder',
                'type': 'directory',
                'properties': 'multiSelections',
                'help': 'Pick one or more folders containing your songs'
              }
	    ]
          }
        ]
      }
    },
    {
      'id': 'displays',
      'label': 'Displays',
       'icon': 'image',
       'form': {
         'groups': [
	  {
	  'label': 'Displays',
            'fields': [
              {
                'label': 'Select Song Display Monitor',
                'key': 'song-display',
                'type': 'radio',
                'options': display_list,
                'help': 'Select the monitor to use for displaying the application'
              },
              {
                'label': 'Select Song Display Monitor',
                'key': 'application-display',
                'type': 'radio',
                'options': display_list,
                'help': 'Select the monitor to use for displaying the application'
              }
	    ]
          }
        ]
      }
    },
  ],
});

let res = fs.existsSync(preferencesFile);
if (res === false) {
  // The file does not exists.
  console.log('songview:/js/preferences.js: PREFERENCES FILE DOES NOT EXIST =', res);

  preferenceFileExists = false;
  console.log('songview:/js/preferences.js: DISPLAYING PREFERENCES WINDOW =', preferences);

  // Bring p the preferences editor.
//window.api.send("toMain", "hideMainWindow");
//  ipc.send('toMain', 'hideMainWindow');
  preferences.show();
  console.log('songview:/js/preferences.js: DONE DISPLAYING PREFERENCES WINDOW =', preferences);
}

else {
  console.log('songview:/js/preferences.js: PREFERENCES FILE DOES EXIST =', res);
  console.log('songview:/js/preferences.js: >>> PREFERENCES =', preferences);

  preferenceFileExists = true;

  // The file exists.
  preferenceData = JSON.parse(fs.readFileSync(preferencesFile));
  console.log('songview:/js/preferences.js: FOUND preferenceData =', preferenceData);
  console.log('songview:/js/preferences.js: COLLECTIONS =', preferenceData.collections);

console.log('songview:/js/preferences.js: COLLECTIONS LENGTH =', preferenceData.collections.length);

  // If there are prefered/saved attributes capture them here.
  if (preferenceData && preferenceData.collections.length > 0) {
console.log('songview:/js/preferences.js: FOUND COLLECTIONS =', collections);
    const dirTree = require("directory-tree");
    songlist = dirTree(preferenceData.collections[0]);
    //console.log('songview:/js/preferences.js: SONGLIST =', songlist)
    console.log('songview:/js/preferences.js: GOT SONGLIST!');
  }
  else {
    // We neeed to set our user preferences.
console.log('songview:/js/preferences.js: NEED PREFERENCES DIALOG.');
//    preferences.show();
//    ipcRenderer.send('synchronous-message', 'edit-preferences')
  }

  if (preferenceData.windowBounds !== undefined) {
    default_window_width = preferenceData.windowBounds.width;
    default_window_height = preferenceData.windowBounds.height;
    console.log('songview:/js/preferences.js:createWindow(): Window location X =', default_window_width);
    console.log('songview:/js/preferences.js:createWindow(): Window location Y =', default_window_height);
  }

  preferences.value('songlist', songlist);
  console.log('songview:/js/preferences.js: preferences =', preferences);

  //const myPref = preferences.value('songlist');
  //console.log('songview:/js/preferences.js: xxxDATA_STORE =', myPref);
}

module.exports = preferences;


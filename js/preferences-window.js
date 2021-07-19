/*
 * SongView Electron Application
 *
 * File: preferences-window.js
 * Author: Daryl Williams
 * Copyright (c) 2021 Daryl Williams
 */

const fs = require('fs');;
const path = require('path');
const { electron, dialog, ipcRenderer } = require('electron');

window.songview = {
  "preferences": {},
};

let preferences = {
  lmsRoot: "",
  Browser: "",
  Displays: [],
  Collections: [],
  WindowLocation: [],
};

window.onload = function() {
  console.log('songview:/js/preferences-window.js: SONGVIEW =', songview);

  let windowCoordinates = [];

  let preferencesStr = ipcRenderer.sendSync('getPreferences');
  preferences = JSON.parse(preferencesStr);
  console.log('songview:/js/preferences-window.js: RECEIVED PREFERENCES =', preferences);

  if (document.getElementById('save-preferences-button') !== null) {
    //console.log('songview:/js/preferences-window.js:window.onload(): FOUND save-preferences-button =', document.getElementById('save-preferences-button'));
    document.getElementById('save-preferences-button').addEventListener('click', (event) => {
      console.log('songview:/js/preferences-window.js:window.onload(): CLICK save-preferences-button =', document.getElementById('save-preferences-button'));
      // Save Preferences and quit.
      //console.log('songview:/js/preferences-window.js:window.onload(): SAVING PREFERENCES =', preferences);
      //let saved = ipcRenderer.sendSync('savePreferences', preferences);
      let saved = ipcRenderer.sendSync('savePreferences', preferences);
      //console.log('songview:/js/preferences-window.js:window.onload(): SAVED =', saved);
      return;
    });
  }

  if (document.getElementById('select-lmsroot-button') !== null) {
    console.log('songview:/js/preferences-window.js:window.onload(): FOUND select-lmsroot-button =', document.getElementById('select-lmsroot-button'));
    document.getElementById('select-lmsroot-button').addEventListener('click', (event) => {
      console.log('songview:/js/preferences-window.js:window.onload(): CLICK select-lmsroot-button =', document.getElementById('select-lmsroot-button'));
      return;
    });
  }

  if (document.getElementById('ul-preferences') !== null) {
    // Handle the Preferences Menu selections.
    //console.log('songview:/js/preferences-window.js:window.onload(): FOUND ul-preferences =', document.getElementById('ul-preferences'));

    document.getElementById('ul-preferences').addEventListener('click', (event) => {
      console.log('songview:/js/preferences-window.js:window.onload(): CLICK ul-preference =', event.target.innerText);

      let preference_filename = event.target.dataset.filename;
      let target_file = preference_filename;
      console.log('songview:/js/preferences-window.js:window.onload(): TARGET_FILE =', target_file);

      let html = fs.readFileSync(target_file, {encoding:'utf8', flag:'r'});
      //console.log('songview:/js/preferences-window.js: action = GOT HTML =', html);

console.log('songview:/js/preferences-window.js: ==>>> PREFERENCES =', preferences);
      let display_string = '<p>';
      for (let i=0, len=preferences.Displays.length; i<len; i++) {
        let display_name = 'song-display-monitor';
//console.log('songview:/js/preferences-window.js: >>> DISPLAY NAME =', display_name);

        let display_label = preferences.Displays[i].label;
//console.log('songview:/js/preferences-window.js: >>> DISPLAY LABEL =', display_label);

        let display_id = display_label.toLowerCase().replace(' ', '-').replace('#','');
//console.log('songview:/js/preferences-window.js: >>> DISPLAY ID =', display_id);

        let checked = 'checked';
        if (i > 0) {
          checked = '';
        }
        display_string += '<input type="radio" id="' + display_id + '" name="' + display_name + '"  onchange="javascript:setDisplay(this);" value="' + display_label + '" ' + checked + '>' + display_label + '<br />';
//console.log('songview:/js/preferences-window.js: >>> DISPLAY STRING =', display_string);
      }
      display_string += '</p>';

      if (preference_filename === 'select-display.html') {
        html = html.replace('REPLACE_WITH_DISPLAY_SELECTION', display_string);
      }

      if (html !== '' && document.getElementById('right-top-panel') !== null) {
        document.getElementById('right-top-panel').innerHTML = html;
      }

      if (document.getElementById('file-select-status') !== null) {
        console.log('songview:/js/preferences-window.js: >>> FILE_SELECT_STATUS PREFS =', preferences);
      }

      return;
    });
  }

  if (document.getElementById('ul-songlist') !== null) {
    //console.log('songview:/js/preferences-window.js:window.onload(): FOUND ul-songlist =', document.getElementById('ul-songlist'));
    document.getElementById('ul-songlist').addEventListener('click', (event) => {
      console.log('songview:/js/preferences-window.js:window.onload(): CLICK ul-songlist =', document.getElementById('ul-songlist'));
      return;
    });
  }

  ipcRenderer.on('dom-update:file-select-status', (event, file_select_status) => {
    //console.log('songview:/js/preferences-window.js:ipcRenderer.on(dom-update:file-select-status): file_select_status =', file_select_status);
    if (document.getElementById('file-select-status') !== null) {
      document.getElementById('file-select-status').innerHTML = file_select_status;
    }
  });

  window.setDisplay = (event) => {
    console.log('songview:/js/preferences-window.js:setDisplays(): BLUR event, SELECT DISPLAY =', event.value);
    console.log('songview:/js/preferences-window.js:setWindowPosition(): event.value =', event.value);
    ipcRenderer.send('updatePreferences', 'display', event.value);
  }

  window.setWindowPosition = (event) => {
    console.log('songview:/js/preferences-window.js:setWindowPosition(): Window position BLUR event =', event);
    console.log('songview:/js/preferences-window.js:setWindowPosition(): Window position BLUR COORD =', event.value);
    console.log('songview:/js/preferences-window.js:setWindowPosition(): Window position BLUR windowCoordinates =', windowCoordinates);

    let coordinate = parseInt(event.value, 10);

    if (Number.isInteger(coordinate)) {
      windowCoordinates.push(event.value);
      if (windowCoordinates.length === 2) {
        ipcRenderer.send('updatePreferences', 'window-coordinates', windowCoordinates);
        console.log('songview:/js/preferences-window.js:setWindowPosition(): windowCoordinates =', windowCoordinates);
      }
    }
  }

  window.displayFolderDialog = (event) => {
    console.log('songview:/js/preferences-window.js:displayFolderDialog(): event =', event);
    if (document.getElementById('preference-form') !== null) {
      console.log('songview:/js/preferences-window.js:displayFolderDialog(): preferenceForm =', document.getElementById('preference-form'));
      let form = document.getElementById('preference-form');
      let select_field = form.elements['preference-field'].value;
      console.log('songview:/js/preferences-window.js:displayFolderDialog(): select_field =', select_field);

      let dialog_title, dialog_message, preference_key, dialog_property_type;

      dialog_title         = form.elements['dialog-title'].value;
      dialog_message       = form.elements['dialog-message'].value;
      dialog_property_type = form.elements['dialog-property-type'].value;
      preference_key       = form.elements['preference-key'].value;

console.log('songview:/js/preferences-window.js:displayFolderDialog(): preference_key =', preference_key);
      
      ///ipcRenderer.send('toPrefs', 'displayFolderDialog', dialog_title, dialog_message, dialog_property_type, preference_key);
      ipcRenderer.send('displayFolderDialog', dialog_title, dialog_message, dialog_property_type, preference_key);
    }
  }
}


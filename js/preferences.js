/*
 * /js/preferences.js
 */

const { app } = require('electron');
const path = require('path');
const os = require('os');
const ElectronPreferences = require('electron-preferences');

//let userData;
//let appname = app.getName().toLowerCase();

let appname = app.getName().toLowerCase();
let preferencesFile = 'preferences.json';

if (process.platform === 'darwin') {
  preferencesFile = app.getPath('home') + '/.config/' + appname + '/' + preferencesFile;
}
else {
  preferencesFile += app.getPath('userData');
}
console.log('songview:/js/preferences.js: preferencesFile =', preferencesFile);

const preferences = new ElectronPreferences({
    /**
     * Where should preferences be saved?
    'dataStore': path.resolve(app.getPath('userData'), 'preferences.json'),
     */
    'dataStore': preferencesFile,
});

const myPref = preferences.value('options');
console.log('songview:/js/preferences.js: myPref =', myPref);

console.log('songview:/js/preferences.js: DATA_STORE =', preferences.options.dataStore);

module.exports.preferences = preferences;


const fs = require('fs');;
const path = require('path');
const { electron, dialog, ipcRenderer } = require('electron');
//const app = require('electron')
//const ipcRenderer = electron.ipcRenderer;

window.onload = function() {

  window.SelectLMSRoot = (event) => {
    //console.log('songview:/js/preferences-window.js: SelectLMSRoot =', SelectLMSRoot);
    //ipcRenderer.send('toMain', 'display-preference-dialog');
    ipcRenderer.send('toPrefs', 'select-lmsroot-directory', event);
  }

  window.getLMSRoot = () => {
    console.log('songview:/js/preferences-window.js: LMS Root =', document.getElementById('ul-preferences'));
    ipcRenderer.send('toMain', 'display-preference-dialog');
  }

  if (document.getElementById('save-preferences-button') !== null) {
    console.log('songview:/js/preferences-window.js:window.onload(): FOUND save-preferences-button =', document.getElementById('save-preferences-button'));
    document.getElementById('save-preferences-button').addEventListener('click', (event) => {
      console.log('songview:/js/preferences-window.js:window.onload(): CLICK save-preferences-button =', document.getElementById('save-preferences-button'));
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
    console.log('songview:/js/preferences-window.js:window.onload(): FOUND ul-preferences =', document.getElementById('ul-preferences'));
    document.getElementById('ul-preferences').addEventListener('click', (event) => {
      console.log('songview:/js/preferences-window.js:window.onload(): CLICK ul-preference =', event.target.innerText);
      //window.api.send("toMain", "get-preference: " + event.target.innerText);

      let target_file = './' + event.target.innerText.toLowerCase().replace(' ', '-') + '.html';
      //console.log('songview:/js/preferences-window.js: action = ZZZZZ get-preference, TARGET =', target_file);
      const html = fs.readFileSync(target_file, {encoding:'utf8', flag:'r'});
      //console.log('songview:/js/preferences-window.js: action = GOT HTML =', html);

      if (document.getElementById('right-top-panel') !== null) {
        document.getElementById('right-top-panel').innerHTML = html;
      }

      return;
    });
  }

  if (document.getElementById('ul-songlist') !== null) {
    console.log('songview:/js/preferences-window.js:window.onload(): FOUND ul-songlist =', document.getElementById('ul-songlist'));
    document.getElementById('ul-songlist').addEventListener('click', (event) => {
      console.log('songview:/js/preferences-window.js:window.onload(): CLICK ul-songlist =', document.getElementById('ul-songlist'));
      return;
    });
  }
}


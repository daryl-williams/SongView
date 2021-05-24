/*
 * SongView Electron Application
 *
 * File: main.js
 * Author: Daryl Williams
 */

const env = process.env.NODE_ENV || 'development';

const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");
const { app, dialog, ipcMain, BrowserWindow, Menu, shell, screen } = require('electron');
const Store = require('./store.js');
const store = new Store();
const template = require('./menu-template.js').template;
//console.log('songview:/js/main.js:dialog.showOpenDialog(): main menu template =', template);

let mainWindow; //Do this so that the window object doesn't get GC'd.

// Setup Hot reload.
//if (env === 'development') {
//  try {
//    require('electron-reloader')(module, {
//      debug: true,
//      watchRenderer: true
//    });
//  } catch (err) {
//    console.log('songview:/js/main.js: development environment hot reload error =', err);
//  }
//}

//global.SongView = {
//  "collection": [],
//  "foo": "bar"
//}

function createWindow () {

  let default_window_width = 1024, default_window_height = 600;
  // Create the application main window.
  mainWindow = new BrowserWindow({
    transparent: false,
    icon: 'favicon.ico',
    title: 'FooBar',
    width: default_window_width,
    height: default_window_height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true
  })

  // This is the event handler for the mainWindow resize event.
  mainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now save the new dimension in the preferences file.
    store.set('windowBounds', { width, height });
  });

/*
  if (createPreferencesFile) {
//preferences.show();

    // The file does not exists, so open a dialog window to select song collection directory.
    dialog.showOpenDialog(mainWindow, {
      title: 'Preferences',
      message: 'Please select at least one SONG COLLECTION',
      properties: ['openDirectory', 'multiSelections']
    }).then(result => {
      console.log('SONG COLLECTIONS: ', result.filePaths)
      if (result.canceled) {
        // The Cancel button has been pressed.
        try {
          console.log('songview:/js/main.js:dialog.showOpenDialog(): CANCELED: ', result.filePaths)
          app.exit(1);
        }
        catch(error) {
          console.log('songview:/js/main.js:dialog.showOpenDialog(): error =', error);
        };
      }
      else {
        // We now have at least one song collection.
        collections = result.filePaths;
console.log('songview:/js/main.js:dialog.showOpenDialog(): COLLECTIONS =', collections);
        const jsonstr = "{\"collections\": " + JSON.stringify(result.filePaths) + "}";
        const jsonobj = JSON.parse(jsonstr);

        // Now write our preferences to disk.
        fs.writeFileSync(preferences_file, JSON.stringify(jsonobj));
console.log('songview:/js/main.js:dialog.showOpenDialog(): WROTE COLLECTIONS to PREFERENCES=', preferences_file);
        preference_data = JSON.parse(fs.readFileSync(preferences_file));
console.log('songview:/js/main.js:createWindow(): preference_data =', preference_data)
      }
    }).catch(error => {
      console.log('songview:/js/main.js:dialog.showOpenDialog(): error =', error)
      app.exit(1);
    });
  }
*/

  // Open the Application Main Window.
  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools();

  let launchSong = (songfile) => {
console.log('songview:/js/main.js:launchSong(): launched songfile =', songfile);
console.log('songview:/js/main.js:createWindow(): HERE >>> preference_data =', preference_data.lms_bin)

    //let cmd = preference_data.lms_bin + '/' + 'dp' ;// + ' ' + songfile;
    let cmd = preference_data.lms_bin + '/' + 'dp' + ' ' + songfile;
console.log('songview:/js/main.js:createWindow(): CMD =', cmd)

    //shell.openExternal(url);
    exec(cmd, (error, data, getter) => {
      if(error){
        console.log("error", error.message);
        return;
      }
      if (getter){
        console.log("GETTER cmd =", cmd, ', data = >>>' + data + '<<<');
        return;
      }
      console.log("data", data);
    });
  };

  // Interprocess communicartion between main process and renderer process.
//  ipcMain.on('asynchronous-message', (event, arg) => {
//    console.log('songview:/js/main.js:dialog.showOpenDialog(): arg =', arg);
//    event.reply('asynchronous-reply', 'pong')
//  });

  ipcMain.on("toMain", (event, request) => {
    console.log('songview:/js/main.js:ipcMain.on(toMain): received request =', request);
    //console.log('songview:/js/main.js:ipcMain.on(toMain): preference_data =', preference_data);

    // Parse the request
    if (request === 'sendPreferences' && preference_data != undefined && preference_data.collections !== undefined && preference_data.collections.length > 0) {
      // Get the first songlist and send it to the songview.js render process.
      const dirTree = require("directory-tree");
      const songlist = dirTree(preference_data.collections[0]);
      preference_data.songlist = songlist;
      // Send result back to renderer process
      mainWindow.webContents.send("fromMain", preference_data);
    }
    else if (request.substring(0, 9) === 'open-song') {
      // Get the first song and launch it in the default browser.
      let arr = request.split(':');
      let songname = arr[1].trim();
console.log('songview:/js/main.js:ipcMain.on(toMain): songname =', songname);
console.log('songview:/js/main.js:ipcMain.on(toMain): cwd =', process.cwd());
      let songfile = preference_data.songlist.path + '/' + songname;
      // Open the song in the browser.
      launchSong(songfile);
    }
    else {
      console.log('songview:/js/main.js:ipcMain.on(toMain): UNKNOWN renderer REQUEST =', request);
    }
  });
};

app.on('ready', () => {

  let userDataPath;
  console.log('songview:/js/main.js:ipcMain.on(ready): CWD =', process.cwd());

  // Define user preferences file and adjust for MacOS.
  let appname = app.getName().toLowerCase();
  console.log('songview:/js/main.js:createWindow(): appname =', appname);

  if (process.platform === 'darwin' || process.platform === 'linux') {
    userDataPath = app.getPath('home') + '/.config/' + appname;
  }
  else {
    userDataPath = app.getPath('userData');
  }
  console.log('songview:/js/main.js:createWindow(): userDataPath =', userDataPath);

  // Make sure directory exists.
  try {
    if (fs.existsSync(userDataPath)) {
      console.log('songview:/js/main.js: Preferences directory exists =', userDataPath);
    }
    else {
      console.log('songview:/js/main.js: Preferences directory does not exist =', userDataPath);
      console.log('songview:/js/main.js: creating preferences directory =', userDataPath);

      try {
        fs.mkdirSync(userDataPath, true);
      }
      catch(error) {
        console.log('songview:/js/main.js: error creating preferences directory, error =', error);
        app.exit(1);
      }
    }
  } catch(error) {
    console.log('songview:/js/main.js: error checking for preferences directory, error =', error);
    app.exit(1);
  }
console.log('songview:/js/main.js: PREFERENCES directory =', userDataPath);

  // The preferences directory now exists. Next we check if the preferences file exists.
  // If it does not we create it else we read the preferences files and set default values.

  // Define the preferences filename.
  let preferences_file = path.join(userDataPath, 'preferences.json');
  console.log('songview:/js/main.js: preferences_file =', preferences_file)

  // Now read the data.
  let collections;
  let preference_data;
  let createPreferencesFile = false;

  let res = fs.existsSync(preferences_file);
  if (res === true) {
    // The file exists.
    preference_data = JSON.parse(fs.readFileSync(preferences_file));
    console.log('songview:/js/main.js:createWindow(): PREFERENCE_DATA =', preference_data)

    // If there are prefered/saved attributes capture them here.
    if (preference_data.dataStore !== undefined) {
    }

    if (preference_data.windowBounds !== undefined) {
      default_window_width = preference_data.windowBounds.width;
      default_window_height = preference_data.windowBounds.height;
      console.log('songview:/js/main.js:createWindow(): Window location X =', default_window_width);
      console.log('songview:/js/main.js:createWindow(): Window location Y =', default_window_height);
    }
  }
  else {
    console.log('songview:/js/main.js:fs.exists(preferences_file): does NOT EXIST.');
    createPreferencesFile = true;
  }

/*
  const size = screen.getPrimaryDisplay().size;
  console.log('songview:/js/main.js: DISPLAY SIZE =', size);

  const displays = screen.getAllDisplays()
  console.log('songview:/js/main.js: DISPLAYS =', displays);

  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
    //return display.bounds;
  })
  console.log('songview:/js/main.js: EXTERNAL DISPLAY =', externalDisplay);
  if (externalDisplay) {
    win = new BrowserWindow({
      x: externalDisplay.bounds.x + 50,
      y: externalDisplay.bounds.y + 50
    })
    win.loadURL('https://github.com')
  }
*/

  const preferences = require('./preferences.js');
console.log('songview:/js/main.js: >>> PREFERENCES =', preferences);
//console.log('songview:/js/main.js: >>> DISPLAYS =', preferences.options.defaults.displays);

  const songlist = preferences.value('songlist');
  //console.log('songview:/js/main.js: SONGLIST =', songlist);

  collections = preferences.value('collections');
  //console.log('songview:/js/main.js: collections =', collections);

  //const notes = preferences.value('notes');
  //console.log('songview:/js/main.js: notes =', notes);

  // Create the main window.
  createWindow();

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


/*
 * SongView Electron Application
 *
 * File: main.js
 * Author: Daryl Williams
 * Copyright (c) 2021 Daryl Williams
 */

const env = process.env.NODE_ENV || 'development';

//const { session } = require('electron')
const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");
const { app, dialog, ipcMain, BrowserWindow, Menu, shell, screen } = require('electron');
const template = require('./menu-template.js').template;
//console.log('songview:/js/main.js:dialog.showOpenDialog(): main menu template =', template);
//const Store = require('./store.js');
//const store = new Store();

let MainWindow; //Do this so that the window object doesn't get GC'd.
let preferences;
let preference_data = {};

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

function createWindow() {

  let scriptname;
  console.log('songview:/js/main.js:createWindow(): PROCESS.ENV =', process.env);

  if (process.env.INIT_CWD) {
    scriptname = process.env.INIT_CWD;
    scriptname = scriptname.substring(scriptname.lastIndexOf('/')+1);
  }
  else {
    scriptname = "songSee";
  }
  console.log('songview:/js/main.js:createWindow(): SCRIPTNAME =', scriptname);

  let default_window_width = 1024, default_window_height = 600;
  // Create the application main window.
  MainWindow = new BrowserWindow({
    transparent: false,
    title: scriptname,
    icon: __dirname + '/app/images/favicon-1.png',
    width: default_window_width,
    height: default_window_height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true
  });

//  MainWindow.webContents.send("sendMyProps", preferences);
//  console.log('songview:/js/main.js:createWindow(): >>> SENT PREFERENCES =', preferences)

  //MainWindow.webContents.send("deliverPreferences", preferences);
//  const { MessageChannelMain } = require('electron');
//  const { port1, port2 } = new MessageChannelMain();
//  MainWindow.webContents.postMessage('port', null, [port2]);
//  port1.postMessage({ some: 'message' })

//    ipcMain.on('deliverPreferences', (event, data) => {
//console.log('songview:/js/main.js:createWindow(): >>> sendProps =', data)
//      event.reply('deliverPreferences', JSON.stringify(preferences));
//    });

//  MainWindow.webContents.send("sendPreferences", preferences);
//  console.log('songview:/js/main.js:createWindow(): SENT PREFERENCES =', preferences)
//  ipcMain.handle('deliverPreferences', async (event, arg) => {
//    // do stuff
//    await awaitableProcess();
//    return "foo";
//  }

  // This is the event handler for the MainWindow resize event.
  MainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = MainWindow.getBounds();
    // Now save the new dimension in the preferences file.
    store.set('windowBounds', { width, height });
  });

/*
  if (createPreferencesFile) {
//preferences.show();

    // The file does not exists, so open a dialog window to select song collection directory.
    dialog.showOpenDialog(MainWindow, {
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
  MainWindow.loadFile('index.html')
  //MainWindow.webContents.openDevTools(); // Developer Tools

  let launchSong = (songfile, preferences) => {
    //console.log('songview:/js/main.js:launchSong(): launched songfile =', songfile);
    console.log('songview:/js/main.js:launchSong(): >> PREFERENCES =', preferences)
    //console.log('songview:/js/main.js:launchSong(): >> LMS_ROOT =', preference_data.lms_root);

    //const browser = preferences.value('browser').text.substring(6);

    const browser = preferences.Browser + '/Contents/MacOS/Safari'; //('browser').text.substring(6);
    console.log('songview:/js/main.js:launchSong(): >> BROWSER =', browser);

    process.env.LMS_ROOT = preferences.lmsRoot;
    process.env.LMS_BROWSER_PATH = preferences.Browser[0];

/*
    if (process.platform === 'darwin') {
      process.env.LMS_BROWSER_PATH = '/Applications/Opt/Firefox.app/Contents/MacOS/firefox' // browser; // '/Applications/Opt/Firefox.app/Contents/MacOS/firefox';
    }
    else if (process.platform === 'darwin') {
      process.env.LMS_BROWSER_PATH = '/Applications/Opt/Firefox.app/Contents/MacOS/firefox' // browser; // '/Applications/Opt/Firefox.app/Contents/MacOS/firefox';
    }
    else if (process.platform === 'darwin') {{
      // What do we do for Windows???
      browser = path.resolve('C:\\Program Files\\', 'edge');
      preferencesFile += app.getPath('userData');
    }
    else {
      console.log('songview:/js/main.js:launchSong(): ERROR unknown browser =', process.env.LMS_BROWSER_PATH);
      return;
    }
*/

    process.env.LMS_SCREEN_HEIGHT = 720;
    process.env.LMS_SCREEN_WIDTH = 1280;
    process.env.PATH = preferences.lmsRoot + '/bin:' + process.env.PATH;

    console.log('songview:/js/main.js:launchSong(): >> PROCESS.ENV.LMS_BROWSER_PATH =', process.env.LMS_BROWSER_PATH);

    //let cmd = preference_data.lms_bin + '/' + 'dp' ;// + ' ' + songfile;
    let cmd = preferences.lmsRoot + '/bin/dp ' + songfile;
    console.log('songview:/js/main.js:createWindow(): CMD =', cmd)

    // Open the song file in the default browser.
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`songview:/js/main.js:launchSong(): ERROR: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`songview:/js/main.js:launchSong(): STDERR: ${stderr}`);
        return;
      }
      console.log(`songview:/js/main.js:launchSong(): STDOUT:\n${stdout}`);
    });
  };

  ipcMain.on("toMain", (event, request, target) => {
    console.log('songview:/js/main.js:ipcMain.on(toMain): RECEIVED request = >' + request + '<');
    //console.log('songview:/js/main.js:ipcMain.on(toMain): received target = >' + target + '<');
    //console.log('songview:/js/main.js:ipcMain.on(toMain): preference_data =', preference_data);
//console.log('songview:/js/main.js:ipcMain.on(toMain): !!! PREFERENCES =', preferences);

    // Parse the request
/*
    if (request === 'display-preference-dialog') {
      // The file does not exists, so open a dialog window to select song collection directory.
      dialog.showOpenDialog(MainWindow, {
        title: 'Preferences',
        message: 'Please select at least one SONG COLLECTION',
        properties: ['openDirectory', 'multiSelections']
      }).then(result => {
        console.log('SONG COLLECTIONS: ', result.filePaths)
        if (result.canceled) {
          // The Cancel button has been pressed.
          try {
            console.log('songview:/js/main.js:dialog.showOpenDialog(): CANCELED: ', result.filePaths)
            //app.exit(1);
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
    if (request.substring(0, 14) === 'get-preference') {
      // This request comes from the ./js/songview.js once the ./index.html page has loaded.
      console.log('songview:/js/main.js:ipcMain.on(toMain): action = ZZZZZ get-preference, PREFERENCE =', request);
      target_file = './' + target.toLowerCase().replace(' ', '-') + '.html';
      console.log('songview:/js/main.js:ipcMain.on(toMain): action = ZZZZZ get-preference, TARGET =', target_file);
      const html = fs.readFileSync(target_file, {encoding:'utf8', flag:'r'});
      event.sender.send('preference-value', html);
      console.log('songview:/js/main.js:ipcMain.on(toMain): action = SENT HTML =', html);
    }
    else if (request === 'savePreferences') {
      console.log('songview:/js/main.js:ipcMain.on(toMain): ACTION = savePreferences, PREFERENCES =', preferences);
    }
    else if (request === 'sendPreferences') {

      console.log('songview:/js/main.js:ipcMain.on(toMain): sendPreferences: >>> SENDING PREFERENCES =', preferences);

      //let lms_root = preferences.lmsRoot;
      console.log('songview:/js/main.js: >>>>> LMS_ROOT =', preferences.lmsRoot);

      //let collections = preferences.Collections[0];
      //console.log('songview:/js/main.js: >>>>> TYPE COLLECTIONS =', typeof collections);
      console.log('songview:/js/main.js: >>>>> TYPE COLLECTIONS =', typeof preferences.Collections[0]);

//      const dirTree = require("directory-tree");
      //const songlist = dirTree(preferences.folder);
//      const songlist = dirTree(preferences.Collections[0]);
//      console.log('songview:/js/main.js: >>>>> SONGLIST =', songlist);

      //preferences.songlist = songlist.children;
      //preference_data.songlist = songlist;
      //preference_data.lms_root = preferences.lms_root;
      //preference_data.collections = preferences.collections;

      if (preferences.Collections[0] && preferences.Collections[0] !== '') {
        console.log('songview:/js/main.js:ipcMain.on(toMain): >>> CDLLECTIONS is defined!!!');
        // Get the first songlist and send it to the songview.js render process.
        // Send result back to renderer process
        //MainWindow.webContents.send("fromMain", preference_data);

//        MainWindow.webContents.send("fromMain", JSON.stringify(preferences));
//        //MainWindow.webContents.send("fromMain", preferences);
//console.log('songview:/js/main.js:ipcMain.on(toMain): Action: sendPreferences:  SENT pREFERENCES =', preferences);
//        event.sender.send('fromMain', preferences);
      }
      else {
        // Collections is undefined, popup the preferences window.
        console.log('songview:/js/main.js:ipcMain.on(toMain): Collections is undefined, popup the preferences window.');
//        preferences.show();
//console.log('songview:/js/main.js:ipcMain.on(toMain): ->@@@@PREFERENCES =', preferences);
        // Save a value within the preferences data store
        //preferences.value('lms_root', preferences.options.lms_root);
//        preferences.value('lms_root', preferences.lms_root);
        //preferences.value('browser', browser);
//console.log('songview:/js/main.js:ipcMain.on(toMain): %%%%PREFERENCES =', preferences.options.defaults);
      }
    }
    else if (request.substring(0, 9) === 'open-song') {
      // Get the first song and launch it in the default browser.
      let arr = request.split(':');
      let songname = arr[1].trim();
console.log('songview:/js/main.js:ipcMain.on(toMain): songname =', songname);
console.log('songview:/js/main.js:ipcMain.on(toMain): CWD =', process.cwd());
      let songfile = preferences.SongList.path + '/' + songname;
      // Open the song in the browser.
      launchSong(songfile, preferences);
    }
    else {
      console.log('songview:/js/main.js:ipcMain.on(toMain): UNKNOWN renderer REQUEST =', request);
    }
  });
};

  ipcMain.on("savePreferences", (event) => {
    console.log('songview:/js/main.js:ipcMain.on(savePreferences): !!!>>> savePreferences PREFERENCES =', preferences);
    //console.log('songview:/js/main.js:ipcMain.on(savePreferences): >>> savePreferences EVENT =', event);

    process.env.PATH = preferences.lmsRoot + '/bin';
    process.env.BROWSER_PATH = preferences.Browser;
    //process.env.Displays = preferences.Display.default;

    console.log('songview:/js/main.js:ipcMain.on(savePreferences): !!!>>> savePreferences PATH =', process.env.PATH);
    console.log('songview:/js/main.js:ipcMain.on(savePreferences): !!!>>> savePreferences BROWSER_PATH =', process.env.BROWSER_PATH);
    //console.log('songview:/js/main.js:ipcMain.on(savePreferences): >>> savePreferences MAIN_WINDOW =', MainWindow);

    event.returnValue = JSON.stringify(preferences);

    MainWindow.webContents.send('preferenceDelivery', JSON.stringify(preferences));
    console.log('songview:/js/main.js:ipcMain.on(savePreferences): >>> savePreferences SENT PREFERENCES =', preferences);

    return;
  });

app.on('ready', () => {
  console.log('songview:/js/main.js:app.on(ready): >>> MAINWindow =', MainWindow)
  // Initialize our application preferences.
  console.log('songview:/js/main.js: >>> start INITIALIZING PREFERENCES =', preferences);
  preferences = require('./preferences.js');
  console.log('songview:/js/main.js: >>> end INITIALIZED PREFERENCES =', preferences);

  let userDataPath;
  //console.log('songview:/js/main.js:ipcMain.on(ready): CWD =', process.cwd());

  // Define user preferences file and adjust for MacOS.
  let appname = app.getName().toLowerCase();
  //console.log('songview:/js/main.js:createWindow(): appname =', appname);

  // Define os specific dependencies, browser, etc.
  if (process.platform === 'darwin') {
    userDataPath = app.getPath('home') + '/.config/' + appname;
  }
  else if (process.platform === 'linux') {
    userDataPath = app.getPath('home') + '/.config/' + appname;
  }
  else {
    userDataPath = app.getPath('userData');
  }
  //console.log('songview:/js/main.js:createWindow(): userDataPath =', userDataPath);

  // Make sure directory exists.
  try {
    if (fs.existsSync(userDataPath)) {
      //console.log('songview:/js/main.js: Preferences directory exists =', userDataPath);
    }
    else {
      //console.log('songview:/js/main.js: Preferences directory does not exist =', userDataPath);
      //console.log('songview:/js/main.js: creating preferences directory =', userDataPath);

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
//console.log('songview:/js/main.js: PREFERENCES directory =', userDataPath);

  // The preferences directory now exists. Next we check if the preferences file exists.
  // If it does not we create it else we read the preferences files and set default values.

  // Define the preferences filename.
  let preferences_file = path.join(userDataPath, 'preferences.json');
  console.log('songview:/js/main.js: preferences_file =', preferences_file)

  // Now read the data.
  let collections;
  let preference_data;
//  let createPreferencesFile = false;

  // Check if the preference file exists.
  let res = fs.existsSync(preferences_file);
  if (res === true) {
    // The file exists.
    console.log('songview:/js/main.js: >>>>> preferences_file exists =', preferences_file)
    //preference_data = JSON.parse(fs.readFileSync(preferences_file));
    //console.log('songview:/js/main.js:createWindow(): PREFERENCE_DATA =', preference_data)

    // MainWindow ends up undefined here for some reason...
    //MainWindow.webContents.send("deliverPreferences", JSON.stringify(preferences));

/*
    //preferences.lmsRoot = preference_data.lms_root.folder;
    preferences.lmsRoot = preference_data.lmsRoot;
    preferences.Collections = preference_data.collections.folder;
    preferences.Displays = preference_data.displays;
    preferences.Browser = preference_data.browser.text;
console.log('songview:/js/main.js: &&&&&& PREFERENCES =', preferences);

    if (preferences.WindowLocation !== undefined) {
      default_window_width = preference_data.windowBounds.width;
      default_window_height = preference_data.windowBounds.height;
      //console.log('songview:/js/main.js:createWindow(): Window location X =', default_window_width);
      //console.log('songview:/js/main.js:createWindow(): Window location Y =', default_window_height);
    }
*/
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

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Subscribing to preference changes.
//  preferences.on('save', (preferences) => {
//    console.log('songview:/js/main.js: ' + `Preferences were saved.`, JSON.stringify(preferences, null, 4));
//  });

//  const songlist = preferences.value('songlist');
  //console.log('songview:/js/main.js: SONGLIST =', songlist);

 // collections = preferences.value('collections');
  //console.log('songview:/js/main.js: >>>>> collections =', collections);

  //const notes = preferences.value('notes');
  //console.log('songview:/js/main.js: notes =', notes);

  // Create the main window.
  createWindow();
});

ipcMain.on('browserReady', (event, data) => {
  console.log('songview:/js/main.js:clientReady(): CLIENT READY <<<>>> sendProps =', preferences)
  // Send proferences.
  event.reply('deliverPreferences', JSON.stringify(preferences));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

module.exports = MainWindow;


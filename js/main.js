/*
 * SongView Electron Application
 *
 * File: main.js
 * Author: Daryl Williams
 */

const env = process.env.NODE_ENV || 'development';

const template = require('./menu-template.js').template;
console.log('songview:/js/main.js:dialog.showOpenDialog(): template =', template);

const fs = require('fs');
const path = require('path');
const { app, dialog, ipcMain, BrowserWindow, Menu} = require('electron');

const Store = require('./store.js');
const store = new Store();

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log('songview:/js/main.js:dialog.showOpenDialog(): arg =', arg) // prints "ping"
  event.reply('asynchronous-reply', 'pong')
});

let mainWindow; //Do this so that the window object doesn't get GC'd.

// Setup Hot reload.
if (env === 'development') {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true
    });
  } catch (_) {console.log('development environment hot reload error');}
}

global.songview = {
  "collection": [],
  "foo": "bar"
}

function createWindow () {

  let width = 1024, height = 600;
  mainWindow = new BrowserWindow({
    icon: 'favicon.ico',
    title: 'FooBar',
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true
  })

//  mainWindow.setTitle('Barfallowmew');

  // The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
  // to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
  mainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height });
  });

  let userDataPath;

  // Define user preferences file and adjust for MacOS.
  let appname = app.getName().toLowerCase();
  if (process.platform === 'darwin') {
    userDataPath = app.getPath('home') + '/.config/' + appname;
  }
  else {
   userDataPath = app.getPath('userData');
  }
  console.log('songview:/js/main.js:dialog.showOpenDialog(): userDataPath =', userDataPath);

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

  // The preferences directory now exists. See if the preferences file exists,
  // if not create it.

  // Define the preferences filename.
  let preferences_file = path.join(userDataPath, 'preferences.json');
  console.log('songview:/js/main.js:dialog.showOpenDialog(): preferences_file =', preferences_file)

  // Now read the data.
  let collections;
  let preference_data;

    let res = fs.existsSync(preferences_file);
    if (res === false) {
console.log('songview:/js/main.js:fs.exists(preferences_file): does NOT EXIST.');
      // File does not exists, so create it.
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
    else {
      preference_data = JSON.parse(fs.readFileSync(preferences_file));
    }

  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools();

  ipcMain.on("toMain", (event, args) => {
    // Do something with the data.
    console.log('songview:/js/main.js:ipcMain.on(toMain): received request =', args);

console.log('songview:/js/main.js:app.whenReady(): >>> preference_data =', preference_data);

    // Get the first songlist.
    if (preference_data) {
      const dirTree = require("directory-tree");
      const songlist = dirTree(preference_data.collections[0]);
//console.log('songview:/js/main.js:app.whenReady(): >>> songlist =', songlist);

      preference_data.songlist = songlist;

      // Send result back to renderer process
      mainWindow.webContents.send("fromMain", preference_data);
    }
  });

/*
  Menu((defaultMenu, separator) => {
    defaultMenu.push({
      label: "File",
      submenu: [
        { label: "my first item" },
        separator(),
        { label: "my second item" }
      ]
    });
    return defaultMenu;
  });

  var menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {label:'Adjust Notification Value'},
        {label:'CoinMarketCap'},
        {label:'Exit'}
      ]
    }
  ])
  Menu.setApplicationMenu(menu);
*/
}

/*
app.whenReady().then(() => {
  createWindow()

  const template = [
    {
      label: 'FooBar',
      submenu: [
        {label: 'item #1'},
        {label: 'item #2'},
        {label: 'item #3'}
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  //Menu.setApplication(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})
*/

/*
const template = [
  {
    label: 'FooBar',
    submenu: [
      {label: 'item #1'},
      {label: 'item #2'},
      {label: 'item #3'}
    ]
  }
];
*/

app.on('ready', () => {
  //app.setName('fooBar');
  createWindow()
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


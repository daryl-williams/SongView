/*
 * songview.js
 *
 */

'use strict';

//const { app, contextBridge, ipcRenderer } = require("electron");

var sv = sv || {};
sv.collections = [];

var songlist;

var songHandler = (event) => {
  let songname = event.target.getAttribute('data-filename');
  console.log('songview:/js/songview.js:window.onload(): SONG SELECTED =', songname);
  window.api.send("toMain", "open-song:" + songname);
}

function populateSongList(songlist) {
  console.log('songview:/js/songview.js:populateSongList(): songlist.length =', songlist.length);

  if (document.getElementById('songlist-div') !== null) {
    console.log('songview:/js/songview.js:window.onload(): FOUND songlist DIV =', document.getElementById('songlist-div'));
    for (let i=0, len=songlist.length; i<len; i++) {
      //console.log('songview:/js/songview.js:window.onload(): SONGLIST['+i+'] =', songlist[i].name);
      let li = document.createElement('li');
      let filename = songlist[i].name;
      let title = filename
        .substring(0, filename.lastIndexOf('.'))
        .split("_")
        .filter(x => x.length > 0)
        .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
        .join(" ");

      li.innerHTML = title;
      li.setAttribute('data-filename', songlist[i].name);
      li.addEventListener("click", songHandler);
      document.getElementById('ul-songlist').appendChild(li);
    }
  }
}

window.onload = function() {

/*
  if (document.getElementById('ul-preferences') !== null) {
    console.log('songview:/js/songview.js:window.onload(): FOUND ul-preferences =', document.getElementById('ul-preferences'));
    document.getElementById('ul-preferences').addEventListener('click', (event) => {
      console.log('songview:/js/songview.js:window.onload(): CLICK ul-preference =', event.target.innerText);
      window.api.send("toMain", "get-preference: " + event.target.innerText);

      return;
    });
  }

  if (document.getElementById('ul-songlist') !== null) {
    console.log('songview:/js/songview.js:window.onload(): FOUND ul-songlist =', document.getElementById('ul-songlist'));
    document.getElementById('ul-songlist').addEventListener('click', (event) => {
      console.log('songview:/js/songview.js:window.onload(): CLICK ul-songlist =', document.getElementById('ul-songlist'));
      return;
    });
  }
*/

  if (document.getElementById('song-collections') !== null) {
    console.log('songview:/js/songview.js:window.onload(): found song-collections div =', document.getElementById('song-collections'));

    window.api.receive('preferenceDelivery', (dataStr) => {
      //console.log('songview:/js/songview.js:window.onload():preferenceDelivery():  !!! RECEIVED data from main process, dataStr =', dataStr);
      let json = JSON.parse(dataStr);
      console.log('songview:/js/songview.js:window.onload():preferenceDelivery():  !!! RECEIVED data from main process, JSON =', json);
      populateSongList(json.SongList.children);
    })

    // Ask the main process to send us the application preferences
    // so we can fill in the song collections and the songlist.
    window.api.send('browserReady');
    console.log('songview:/js/songview.js:window.onload(): >>> SENT BROWSER READY MESSAGE')

    window.api.receive("deliverPreferences", (dataStr) => {
      console.log('songview:/js/songview.js:window.onload(): >>> browserReady RECEIVED preferences from main process, dataStr =', dataStr.length);
      if (typeof dataStr !== 'undefined') {
        let preferences = JSON.parse(dataStr);
        console.log('songview:/js/songview.js:window.onload(): PREFERENCE DATA =', preferences);
        const song_collection = preferences.Collections;
        console.log('SONG_COLLECTION =', song_collection);

        // Handle mutiple song collections...
//        for (let i=0, len=song_collection.length; i<len; i++) {
//          console.log('SONG_COLLECTION['+i+'] =', song_collection[i]);
          let option = document.createElement('option');
          let collection_name = song_collection[0]; //[i].folder;
          console.log('COLLECTION_NAME =', collection_name);
          //option.text = song_collection[i].path.substring(song_collection[i].path.lastIndexOf('/')+1);
          option.text = collection_name;
          document.getElementById('song-collections').add(option);
//        }

        const songlist = preferences.SongList;
        //console.log('songview:/js/songview.js:window.onload(): SONGLIST =', songlist);
console.log('songview:/js/songview.js:window.onload(): LOOKING FOR songlist DIV =', document.getElementById('songlist-div'));

        if (preferences.SongList.children) {
          populateSongList(preferences.SongList.children);
        }
/*
        if (document.getElementById('songlist-div') !== null) {
console.log('songview:/js/songview.js:window.onload(): FOUND songlist DIV =', document.getElementById('songlist-div'));
          for (let i=0, len=songlist.length; i<len; i++) {
            //console.log('songview:/js/songview.js:window.onload(): SONGLIST['+i+'] =', songlist[i].name);
            let li = document.createElement('li');
            let filename = songlist[i].name;
            let title = filename
                  .substring(0, filename.lastIndexOf('.'))
                  .split("_")
                  .filter(x => x.length > 0)
                  .map((x) => (x.charAt(0).toUpperCase() + x.slice(1)))
                  .join(" ");
//console.log('songview:/js/songview.js:window.onload(): TITLE =', title);
            li.innerHTML = title;
            li.setAttribute('data-filename', songlist[i].name);
            li.addEventListener("click", songHandler);
            document.getElementById('ul-songlist').appendChild(li);
          }
        }
*/
      }
    });
  }

  // Ask the main process for our user preferences.
  //let preferences = window.api.sendPreferences('fromSongView');
  //window.api.send('toMain', 'sendPreferences');
  //console.log('songview:/js/songview.js:window.onload(): SENT Request TO preferences.js:toMain: LOAD_PREFERENCES REQUEST');

}


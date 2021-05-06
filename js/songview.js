/*
 * songview.js
 */

'use strict';

var sv = sv || {};
sv.collections = [];

var songlist;

window.onload = function() {
  // Ask the main process for our user preferences.
  window.api.send("toMain", "sendPreferences");

/*
  if (document.getElementById('ul-songlist') !== null) {
    console.log('songview:/js/songview.js:window.onload(): FOUND ul-songlist =', document.getElementById('ul-songlist'));
    document.getElementById('ul-songlist').addEventListener('click', (event) => {
      console.log('songview:/js/songview.js:window.onload(): CLICK ul-songlist =', document.getElementById('ul-songlist'));
    });
  }
*/

  if (document.getElementById('song-collections') !== null) {
    console.log('songview:/js/songview.js:window.onload(): found song-collections div =', document.getElementById('song-collections'));

    window.api.receive("fromMain", (data) => {
      console.log('songview:/js/songview.js:window.onload(): received data from main process, data =', data);
      if (data !== undefined) {
        console.log('songview:/js/songview.js:window.onload(): DATA =', data);
        const song_collection = data.collections;
        console.log('SONG_COLLECTION =', song_collection);
        for (let i=0, len=song_collection.length; i<len; i++) {
          console.log('SONG_COLLECTION['+i+'] =', song_collection[i]);
          let option = document.createElement('option');
          option.text = song_collection[i].substring(song_collection[i].lastIndexOf('/')+1);
          document.getElementById('song-collections').add(option);
        }

        const songlist = data.songlist.children;
        //console.log('songview:/js/songview.js:window.onload(): SONGLIST =', songlist);

        let songHandler = (event) => {
          let songname = event.target.getAttribute('data-filename');
          console.log('songview:/js/songview.js:window.onload(): SONG SELECTED =', songname);
          window.api.send("toMain", "open-song: " + songname);
        }

        if (document.getElementById('songlist-div') !== null) {
//console.log('songview:/js/songview.js:window.onload(): FOUND songlist DIV =', document.getElementById('songlist-div'));
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
      }
    });
  }

}


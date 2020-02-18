import { youtubeVideoInfo, youtubeAudioStreams } from "./youtube";
import "regenerator-runtime/runtime";
import "core-js/proposals/iterator-helpers";
import * as asyncdb from "../src/index";

window.asyncdb = asyncdb;

!(async () => {
  const db = (window.db = await asyncdb.openDB("youtube", 1, {
    upgrade(db) {
      const store = db.createObjectStore("audio", { keyPath: "videoId" });
      store.createIndex("title", "title", { unique: false }), store.createIndex("title2", "title");
    },
    close: () => console.error("closed"),
    change: db => db.close()
  }));

  // const [store] = db.transaction()
  // const title = store.index('title')
  // console.log(await store.get(2), await store.getAll())

  // for (const line of db.transaction('audio')) {
  // 	console.log('line',line)
  // }

  for await (const line of AsyncIterator.from(db.objectStore("audio")).take(1)) {
    console.log(line);
  }

  const audio = db.objectStore("audio");
  Promise.all([
    AsyncIterator.from(db.objectStore("audio"))
      .take(1)
      .toArray(),
    audio.count(),
    audio.put({ videoId: 3, title: "foo bar" }),
    audio.get(3),
    audio.getKey(asyncdb.range.bound(1, 3)),
    audio.getAll(),
    audio.getAllKeys(),
    audio.index("title"),
    audio.openCursor(),
    db.transaction("audio").then(([audio]) => audio.put({ videoId: 2, title: "test Vidéo" }))
  ])
    .then(console.log)
    .catch(console.error);

  console.log();
  // db.close()
  return;
  // db.delete()

  const has = key => db.objectStore("audio").openKeyCursor(key);

  const add = data => db.objectStore("audio").add(data);

  const save = async videoId => {
    const info = await youtubeVideoInfo(videoId);
    const [stream] = youtubeAudioStreams(info);
    const file = await fetch(`https://cors-anywhere.herokuapp.com/${stream.url}`).then(response =>
      response.blob()
    );
    return add({ ...info.videoDetails, file });
  };

  const videoId = "btDyQlFQCew"; // 'xF_QkfZI1mM'

  if (!(await has(videoId))) {
    await save(videoId);
  }

  // const { file } = await get(videoId)
  // document.querySelector('audio').src = URL.createObjectURL(file)
  // const file_writer = await result.createWriter({ createIfNotExists: true });
  // ... write to file_writer
})();

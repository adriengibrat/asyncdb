import { once } from "./utils/once";
import { wrapRequest } from "./request";
import { wrapDatabase } from "./database";

/* global indexedDB, IDBKeyRange */

export const /* async */ openDB = (name = "keyval", version, { upgrade, change, close } = {}) => {
    const request = indexedDB.open(name, version);
    if (upgrade) {
      once(request, "upgradeneeded", event =>
        upgrade(wrapDatabase(request.result, close, true), event.oldVersion, event.newVersion)
      );
    }
    return wrapRequest(request, () => {
      const _db = request.result;
      const db = wrapDatabase(_db, close);
      if (close) {
        once(_db, "close", () => close());
      }
      if (change) {
        once(_db, "versionchange", event => change(db, event.oldVersion, event.newVersion));
      }
      return db;
    });
  };

export const /* async */ deleteDB = name => wrapRequest(indexedDB.deleteDatabase(name), () => {});

export const /* async */ listDB = () => indexedDB.databases();

export const compare = (a, b) => indexedDB.cmp(a, b);

export const range = IDBKeyRange;

/*
	https://github.com/jakearchibald/idb
	https://dexie.org/
	https://github.com/maxgaurav/indexeddb-orm
	https://www.freecodecamp.org/news/a-quick-but-complete-guide-to-indexeddb-25f030425501/
*/

// import {proxy} from './proxy/index'
// export default proxy

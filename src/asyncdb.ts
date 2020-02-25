import { once } from "./utils/once";
import { IDBVersionChangeEvent } from "./utils/error";
import { wrapRequest } from "./request";
import { wrapDatabase, Database, UpgradingDatabase } from "./database";

/* global indexedDB, IDBKeyRange */

interface OpenDBOptions {
  upgrade?: (db: UpgradingDatabase, oldVersion: number, newVersion: number | null) => any;
  change?: (db: Database, oldVersion: number, newVersion: number | null) => any;
  close?: () => any;
}

export const /* async */ openDB = (
    name = "keyval",
    version?: number,
    { upgrade, change, close }: OpenDBOptions = {}
  ) => {
    const request = indexedDB.open(name, version);
    if (upgrade) {
      once(request, "upgradeneeded", (event: IDBVersionChangeEvent) =>
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
        once(_db, "versionchange", (event: IDBVersionChangeEvent) =>
          change(db, event.oldVersion, event.newVersion)
        );
      }
      return db;
    });
  };

export const /* async */ deleteDB = (name: string) =>
    wrapRequest(indexedDB.deleteDatabase(name), () => {});

export const compare = (a: any, b: any) => indexedDB.cmp(a, b);

export const range = IDBKeyRange;

/*
	https://github.com/jakearchibald/idb
	https://dexie.org/
	https://github.com/maxgaurav/indexeddb-orm
	https://www.freecodecamp.org/news/a-quick-but-complete-guide-to-indexeddb-25f030425501/
*/

// import {proxy} from './proxy/index'
// export default proxy

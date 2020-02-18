import { validString } from "./utils/valid";
import { openDatabase } from "../index";

const asyncObjectStoreIterator = dbPromise =>
  async function*(mode = "readwrite") {
    // Async Iterator protocol
    const db = await dbPromise;
    const objectStoreNames = db.objectStoreNames;
    for (let index = 0; index < objectStoreNames.length; ) {
      yield db.objectStore(objectStoreNames[index++], mode);
    }
  };

export const proxyDb = dbPromise =>
  new Proxy(
    Object.assign(function() {}, { cache: {} }),
    {
      apply() {
        return dbPromise.then(db => db.objectStoreNames);
      },
      get({ cache }, storeName) {
        if (Symbol.iterator === storeName) {
          throw new Error("Only for await...of is supported");
        }
        if (Symbol.asyncIterator === storeName) {
          return cache[storeName] || (cache[storeName] = asyncObjectStoreIterator(dbPromise));
        }
        if ("then" === storeName) {
          return run => dbPromise.then(run);
        }
        if ("_" === storeName[0]) {
          return (
            cache[storeName] || (cache[storeName] = dbPromise.then(db => db[storeName.slice(1)]))
          );
        }
        validString(storeName);
        return dbPromise.then(db => db.objectStore(storeName));
      },
      set({ cache }, storeName, options) {
        validString(storeName);
        Object.keys(cache).forEach(key => delete cache[key]);
        return (dbPromise = dbPromise.then(db => {
          db.close();
          return openDatabase(db.name, db.version + 1, {
            upgrade(db) {
              db.createObjectStore(storeName, options);
            }
          });
        }));
      },
      deleteProperty({ cache }, storeName) {
        validString(storeName);
        Object.keys(cache).forEach(key => delete cache[key]);
        return (dbPromise = dbPromise.then(db => {
          db.close();
          return openDatabase(db.name, db.version + 1, {
            upgrade(db) {
              db.deleteObjectStore(storeName);
            }
          });
        }));
      }
    }
  );

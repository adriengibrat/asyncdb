import { openDatabase, deleteDatabase, databaseNames } from "../index";
import { validString } from "./utils/valid";
import { proxyDb } from "./database";

const asyncDbIterator = async function*() {
  // Async Iterator protocol
  const databases = await databaseNames();
  for (let index = 0; index < databases.length; ) {
    yield openDatabase(databases[index++].name);
  }
};

const close = dbPromise => Promise.resolve(dbPromise && dbPromise.then(db => db.close()));

export const proxy = new Proxy(
  Object.assign(function() {}, { cache: {} }),
  {
    apply() {
      return databaseNames();
    },
    get({ cache }, dbName) {
      if (Symbol.asyncIterator === dbName) {
        return asyncDbIterator;
      }
      if (Symbol.iterator === dbName) {
        throw new Error("Only for await...of is supported");
      }
      if ("then" === dbName) {
        throw new Error("Do not await proxy");
      }
      validString(dbName);
      return cache[dbName] || (cache[dbName] = proxyDb(openDatabase(dbName)));
    },
    set({ cache }, dbName, options) {
      validString(dbName);
      return close(cache[dbName]).then(
        () => (cache[dbName] = proxyDb(openDatabase(dbName, options.version, options)))
      );
    },
    deleteProperty({ cache }, dbName) {
      validString(dbName);
      return close(cache[dbName]).then(() => delete cache[dbName] && deleteDatabase(dbName));
    }
  }
);

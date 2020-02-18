import { wrap } from "./utils/wrap";
import { wrapRequest } from "./request";
import { wrapCursor } from "./cursor";

/* global Symbol */

const asyncIterator = async function*(request, result = wrapCursor) {
  for (let cursor; (cursor = await wrapRequest(request)); cursor.continue(yield result(cursor)));
};

const cursor = instance => {
  return {
    ...wrap(instance, ["openCursor", "openKeyCursor"], request =>
      wrapRequest(request).then(wrapCursor)
    ),
    async *cursor(query, direction) {
      yield* asyncIterator(instance.openCursor(query, direction));
    },
    async *keyCursor(query, direction) {
      yield* asyncIterator(instance.openKeyCursor(query, direction));
    },
    async *[Symbol.asyncIterator](query, direction) {
      // Async Iterator protocol
      yield* asyncIterator(instance.openCursor(query, direction), cursor => cursor.value);
    }
  };
};

const properties = ["name", "autoIncrement", "keyPath"];

const indexMethods = ["count", "get", "getAll", "getKey", "getAllKeys"];

const wrapIndex = index => ({
  ...wrap(index, [...properties, "multiEntry", "unique"]),
  ...wrap(index, indexMethods, wrapRequest),
  ...cursor(index)
});

export const wrapStore = (store, upgrading) => ({
  mode: store.transaction.mode,
  ...wrap(store, [...properties, ...(upgrading ? ["createIndex", "deleteIndex"] : [])]),
  ...wrap(store, ["index"], wrapIndex),
  ...wrap(store, [...indexMethods, "put", "add", "delete", "clear"], wrapRequest),
  ...cursor(store)
});

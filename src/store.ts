import { wrap } from "./utils/wrap";
import { wrapRequest } from "./request";
import { wrapCursor } from "./cursor";

/* global Symbol */

export type ObjectStore<mode> = {}

interface AsyncIterator {
  (request: IDBRequest<IDBCursor | null>, result?: Function): AsyncGenerator<IDBValidKey, void, IDBValidKey>;
  (request: IDBRequest<IDBCursorWithValue | null>, result?: Function): AsyncGenerator<any, void, IDBValidKey>;
}

const asyncIterator: AsyncIterator = async function*(request: IDBRequest, result: Function = wrapCursor) {
  for (let cursor: IDBCursor; (cursor = await wrapRequest(request)); cursor.continue(yield result(cursor)));
};

const cursorLike = (instance: IDBObjectStore | IDBIndex) => {
  return {
    ...wrap(instance, ["openCursor", "openKeyCursor"], (request: IDBRequest<IDBCursor>) =>
      wrapRequest(request).then(wrapCursor)
    ),
    async *cursor(query?: IDBValidKey | IDBKeyRange, direction?: IDBCursorDirection) {
      yield* asyncIterator(instance.openCursor(query, direction));
    },
    async *keyCursor(query?: IDBValidKey | IDBKeyRange, direction?: IDBCursorDirection) {
      yield* asyncIterator(instance.openKeyCursor(query, direction));
    },
    async *[Symbol.asyncIterator](query?: IDBValidKey | IDBKeyRange, direction?: IDBCursorDirection) {
      // Async Iterator protocol
      yield* asyncIterator(instance.openCursor(query, direction), (cursor: IDBCursorWithValue) => cursor.value);
    }
  };
};

const properties = ["name", "autoIncrement", "keyPath"];

const indexMethods = ["count", "get", "getAll", "getKey", "getAllKeys"];

const wrapIndex = (index: IDBIndex) => ({
  ...wrap(index, [...properties, "multiEntry", "unique"]),
  ...wrap(index, indexMethods, wrapRequest),
  ...cursorLike(index)
});

export const wrapStore = (store: IDBObjectStore, upgrading?: boolean) => ({
  mode: store.transaction.mode,
  ...wrap(store, [...properties, ...(upgrading ? ["createIndex", "deleteIndex"] : [])]),
  ...wrap(store, ["index"], wrapIndex),
  ...wrap(store, [...indexMethods, "put", "add", "delete", "clear"], wrapRequest),
  ...cursorLike(store)
});

import { wrap } from "./utils/wrap";
import { wrapTransaction } from "./transaction";
import { wrapStore } from "./store";

/* global Array */

const READWITE = "readwrite";

export const wrapDatabase = (db, onclose, upgrading) => ({
  ...wrap(db, ["name", "version", ...(upgrading ? ["deleteObjectStore"] : [])]),
  ...wrap(db, upgrading ? ["createObjectStore"] : [], store => wrapStore(store, upgrading)),
  objectStore(name, mode = READWITE) {
    return wrapStore(db.transaction(name, mode).objectStore(name), upgrading);
  },
  transaction(names = Array.from(db.objectStoreNames), mode = READWITE) {
    return wrapTransaction(db.transaction(names, mode), [].concat(names), upgrading);
  },
  close() {
    db.close();
    onclose && onclose();
  }
});

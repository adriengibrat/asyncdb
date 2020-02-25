import { wrap } from "./utils/wrap";
import { wrapTransaction, Transaction } from "./transaction";
import { wrapStore, ObjectStore } from "./store";

/* global Array */

type TransactionMode = "readonly" | "readwrite";

export interface Database {
  name: string;
  version: number;
  objectStore<TransactionMode = "readwrite">(
    name: string,
    mode?: TransactionMode
  ): ObjectStore<TransactionMode>;
  transaction<TransactionMode = "readwrite">(
    names: string | string[],
    mode?: TransactionMode
  ): Transaction<TransactionMode>;
  close(): void;
}

export interface UpgradingDatabase extends Database {
  createObjectStore(name: string, options?: IDBObjectStoreParameters): ObjectStore<"versionchange">;
  deleteObjectStore(name: string): void;
}

const readwrite = "readwrite";

interface WrapDatabase {
  (db: IDBDatabase, onclose: undefined | (() => void), upgrading: true): UpgradingDatabase;
  (db: IDBDatabase, onclose?: () => void): Database;
}

export const wrapDatabase: WrapDatabase = (
  db: IDBDatabase,
  onclose?: () => void,
  upgrading?: boolean
) => ({
  ...(wrap(db, [
    "name",
    "version",
    ...(upgrading ? ["deleteObjectStore"] : [])
  ]) as any) /* TODO fix types! */,
  ...wrap<ObjectStore<"readwrite">>(db, upgrading ? ["createObjectStore"] : [], (store: IDBObjectStore) =>
    wrapStore(store, upgrading)
  ),
  objectStore(name: string, mode: TransactionMode = readwrite) {
    return wrapStore(db.transaction(name, mode).objectStore(name), upgrading);
  },
  transaction(
    names: string | string[] = Array.from(db.objectStoreNames),
    mode: TransactionMode = readwrite
  ) {
    return wrapTransaction<TransactionMode>(
      db.transaction(names, mode),
      ([] as string[]).concat(names),
      upgrading
    );
  },
  close() {
    db.close();
    onclose && onclose();
  }
});

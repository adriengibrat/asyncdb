import { once } from "./utils/once";
import { eventError, IDBRequestEvent } from "./utils/error";
import { wrapStore, ObjectStore } from "./store";

/* global Promise, Symbol */

export interface Transaction<TransactionMode = IDBTransactionMode> extends PromiseLike<ObjectStore<TransactionMode>[]> {
  mode: IDBTransactionMode;
  objectStore(name: string): ObjectStore<TransactionMode>;
  [Symbol.iterator](): IterableIterator<ObjectStore<TransactionMode>>;
}

export const wrapTransaction = <TransactionMode = IDBTransactionMode>(
  transaction: IDBTransaction,
  objectStoreNames: string[],
  upgrading?: boolean
): Transaction<TransactionMode> => {
  const objectStore = (name: string) => wrapStore(transaction.objectStore(name), upgrading);
  return {
    mode: transaction.mode as IDBTransactionMode,
    objectStore,
    then(onFulfilled?, onRejected?) {
      // Thennable interface
      return new Promise<ObjectStore<TransactionMode>[]>((resolve, reject) => {
        once(transaction, "complete", () => resolve(objectStoreNames.map(objectStore)));
        once(transaction, "error", (event: IDBRequestEvent) =>
          reject(eventError(event, "Transaction error"))
        );
        once(transaction, "abort", (event: IDBRequestEvent) =>
          reject(eventError(event, "Transaction aborted"))
        );
      }).then(onFulfilled, onRejected);
    },
    *[Symbol.iterator]() {
      for (
        let index = 0;
        index < objectStoreNames.length;
        yield objectStore(objectStoreNames[index++])
      );
    }
  };
};

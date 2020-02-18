import { once } from "./utils/once";
import { eventError } from "./utils/error";
import { wrapStore } from "./store";

/* global Promise, Symbol */

export const wrapTransaction = (transaction, objectStoreNames, upgrade) => {
  const objectStore = name => wrapStore(transaction.objectStore(name), upgrade);
  return {
    mode: transaction.mode,
    objectStore,
    then(run) {
      return new Promise((resolve, reject) => {
        // Thennable interface
        const result = run(objectStoreNames.map(objectStore));
        once(transaction, "complete", () => resolve(result));
        once(transaction, "error", event => reject(eventError(event, "Transaction error")));
        once(transaction, "abort", event => reject(eventError(event, "Transaction aborted")));
      });
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

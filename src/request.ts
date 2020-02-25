import { once } from "./utils/once";
import { eventError, IDBRequestEvent, IDBVersionChangeEvent } from "./utils/error";

/* global Promise */

interface WrapRequest {
  <T>(request: IDBRequest<T>): Promise<T>;
  <T, U>(request: IDBRequest<T>, open: (a: T) => U): Promise<U>;
}

export const wrapRequest: WrapRequest = <T>(request: IDBRequest<T>, open?: Function) =>
  new Promise<T>((resolve, reject) => {
    once(request, "success", () => resolve(open ? open() : request.result));
    if (open) {
      once(request, "blocked", (event: IDBVersionChangeEvent) =>
        reject(eventError(event, `Blocked from version ${event.oldVersion} to ${event.newVersion}`))
      );
    }
    once(request, "error", (event: IDBRequestEvent) => reject(eventError(event, "Request error")));
  });

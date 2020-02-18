import { once } from "./utils/once";
import { eventError } from "./utils/error";

/* global Promise */

export const wrapRequest = (request, open) =>
  new Promise((resolve, reject) => {
    once(request, "success", () => resolve(open ? open() : request.result));
    if (open) {
      once(request, "blocked", event =>
        reject(eventError(event, `Blocked from version ${event.oldVersion} to ${event.newVersion}`))
      );
    }
    once(request, "error", event => reject(eventError(event, "Request error")));
  });

import { IDBRequestEvent, IDBVersionChangeEvent } from "./error";

type VersionChangeEventListener = (event: IDBVersionChangeEvent) => any;
type RequestEventListener = (event: IDBRequestEvent) => any;

export const once = (
  target: EventTarget,
  event: string,
  handler: VersionChangeEventListener | RequestEventListener
) => target.addEventListener(event, handler as EventListener, { once: true });

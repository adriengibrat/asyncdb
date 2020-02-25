/* global Error */

export interface IDBRequestEvent extends Event {
  readonly target: IDBRequest;
}

export interface IDBVersionChangeEvent extends IDBRequestEvent {
  readonly newVersion: number | null;
  readonly oldVersion: number;
}

export const eventError = ({ target }: { target: IDBRequest }, reason: string) =>
  new Error(`${reason}${target.readyState !== "pending" ? `: ${target.error}` : ""}`);

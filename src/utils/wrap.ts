import { identity } from "./identity";

/* global Object */

declare global {
  interface ObjectConstructor {
    fromEntries<V = any, K = string>(entries: Iterable<readonly [K, V]>): { [k in string]: V };
  }
}

const map = <T>(
  keys: string[],
  getValue: (key: string) => T,
  mapKey: (key: string) => string = identity
) => Object.fromEntries(keys.map(key => [mapKey(key), getValue(key)]));

export const wrap = <T>(target: Record<string, any>, properties: string[], wrapper: Function = identity) =>
  map<T>(properties, property =>
    typeof target[property] === "function"
      ? (...args: any[]) => wrapper(target[property](...args))
      : target[property]
  );

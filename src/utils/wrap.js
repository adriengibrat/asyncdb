/* global Object */

const identity = a => a;

const map = (keys, getValue, mapKey = identity) =>
  Object.fromEntries(keys.map(key => [mapKey(key), getValue(key)]));

export const wrap = (target, properties, wrapper = identity) =>
  map(properties, property =>
    typeof target[property] === "function"
      ? (...args) => wrapper(target[property](...args))
      : target[property]
  );

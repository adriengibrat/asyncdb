/* global Error */

export const eventError = ({ target }, reason) =>
  new Error(`${reason}${target.readyState !== "pending" ? `: ${target.error}` : ""}`);

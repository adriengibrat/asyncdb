export const once = (target, event, handler) =>
  target.addEventListener(event, handler, { once: true });

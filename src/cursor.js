import { wrap } from "./utils/wrap";
import { wrapRequest } from "./request";

export const wrapCursor = cursor =>
  cursor && {
    ...wrap(cursor, [
      "direction",
      "value",
      "key",
      "primaryKey",
      "advance",
      "continue",
      "continuePrimaryKey"
    ]),
    ...wrap(cursor, ["update", "delete"], wrapRequest)
  };

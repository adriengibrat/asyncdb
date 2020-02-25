import { wrap } from "./utils/wrap";
import { wrapRequest } from "./request";

interface WrapCursor {
  (cursor: IDBCursor): any;
  (cursor: IDBCursorWithValue): any;
}

export const wrapCursor: WrapCursor = (cursor: IDBCursor) =>
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

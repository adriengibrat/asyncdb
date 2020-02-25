[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# asyncdb

`asyncdb` is a simple & lightweight [IndexedDB](https://caniuse.com/#feat=indexeddb2) wrapper for modern browsers, bundled in 3 flavours:

- a tiny **esm** [module](https://caniuse.com/#feat=es6-module) (~1kb brolti'd) for modern evergreen browsers, using [generators](https://caniuse.com/#feat=es6-generators), [async functions](https://caniuse.com/#feat=async-functions) & [async generators](https://caniuse.com/#feat=mdn-javascript_functions_method_definitions_async_generator_methods).
- a **support** script (~1.75kb) for aging browsers (from 2015), exposing `asyncdb` as global object, using only [generators](https://caniuse.com/#feat=es6-generators) ([async functions](https://caniuse.com/#feat=async-functions) & [async generators](https://caniuse.com/#feat=mdn-javascript_functions_method_definitions_async_generator_methods) are polyfilled).
- a **compat** script (~2.15kb) exposing `asyncdb` as global object for IE 11, using all sort of polyfills.

## Install

With npm:

```sh
npm install asyncdb
```

With yarn:

```sh
yarn add asyncdb
```

### Import

You can import just what you need (or the whole module) in your javascript / typescript codebase:

```js
import { openDB, deleteDB, compare, range } from 'asyncdb'
// or
// import * as asyncdb from 'asyncdb'

```

### From unpkg (for prototyping)

Import module directly from html with module script tag:

```html
<script type="module">
	import { openDB } from 'https://unpkg.com/asyncdb';
	const blog = openDatabase("blog");
</script>
```

Dynamic import are also possible, usefull for REPL/console tests & debug:

```js
const { openDatabase } = await import("https://unpkg.com/asyncdb");
const blog = openDatabase("blog");
```

For IE and older browsers compatibility, use the global compat flavor with simple script tag:

```html
<script src="https://unpkg.com/asyncdb/global.support.min.js"></script>
<script>
	var blog = asyncdb.openDatabase("blog");
</script>
```

## Browser support

For IE & Egde support of `objectStore(...).getAll`, `objectStore(...).getAllKeys`, `index(...).getAll`, and `index(...).getAllKeys` (or to use it in Safari 10.1 worker), you must also import [IndexedDB-getAll-shim](https://github.com/dumbmatter/IndexedDB-getAll-shim).

## Examples

```js
(async () => {
  const { openDatabase } = await import("https://unpkg.com/asyncdb");
  // open or create blog database v1
  const db = await openDatabase("blog", 1, {
    upgrade(db) {
      // create table
      const posts = db.createObjectStore("posts", { autoIncrement: true });
      // create indexes
      posts.createIndex("title", "title", { unique: false });
      posts.createIndex("tag", "tags", { multiEntry: true });
      // insert data
      posts.add({ title: "My article", tags: ["awesome", "me"] });
      posts.add({ title: "Other article", tags: ["awesome", "other"] });
    }
  });
  // read all blog posts
  const posts = await db.objectStore("posts").getAll();
  for (const post of posts) {
    console.log(post);
  }
})();
```

Ready to be copy-pasted in your devtool console: select, `ctrl+c`, `ctrl+shift+j`, `ctrl+v`!

### Async iteration

You may prefer to iterate asynchronously with [for await...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of):

```js
// read all blog posts
for await (const post of db.objectStore("posts")) {
  console.log(post);
}
// update all blog posts using cursor
const cursor = db.objectStore("posts").cursor();
for await (const entry of cursor) {
  entry.update({ ...entry.value, author: "me" });
}
// delete all blog post after #2 using cursor
const cursor = db.objectStore("posts").cursor(IDBKeyRange.lowerBound(2));
for await (const entry of cursor) {
  entry.delete();
}
```

`for await...of` is supported by recent browsers, it uses [Symbol.asyncIterator](https://caniuse.com/#feat=mdn-javascript_builtins_symbol_asynciterator) under the hood.<br>
For [Edge and older browsers](https://caniuse.com/#feat=mdn-javascript_statements_for_await_of), you'll need to transpile your code using [babel](https://babeljs.io/docs/en/usage#cli-tool) with [async-generator plugin](https://babeljs.io/docs/en/babel-plugin-proposal-async-generator-functions) (see the [rollup config ](rollup.config.js#L38) of this repository for a working example).

### Async manipulation

You also may dare to use the [iterator helpers](https://kangax.github.io/compat-table/esnext/#test-Iterator_Helpers):

```js
// wrap all blog post titles in html headings
const headlines = AsyncIterator.from(db.objectStore("posts")).map(
  ({ title }) => `<h2>${title}</h2>`
);
for await (const headline of headlines) {
  console.log(headline);
}
```

`AsyncIterator` is yet a [stage 2 proposal](https://github.com/tc39/proposal-iterator-helpers), only provided by a few libraries like [core-js@3](https://github.com/zloirock/core-js#iterator-helpers) & [IxJS](https://github.com/ReactiveX/IxJS#asynciterable).

You can import one core-js or some IxJS modules to enjoy iterator helpers.

This is how to import the convenience [core-js module](https://unpkg.com/browse/core-js/proposals/) with both `AsyncIterator` & `Iterator` constructors:

```js
import "core-js/proposals/iterator-helpers";
```

And this are the [IxJS modules](https://unpkg.com/browse/ix/) required for the previous example:

```js
import { AsyncIterableX as AsyncIterator } from "ix/asynciterable/asynciterablex";
import "ix/add/asynciterable/from";
import "ix/add/asynciterable-operators/map";
import "ix/add/asynciterable-operators/toarray";
```

N.B. Unfortunately IxJS modules are not unpkg.com ready & [core-js does not provide es modules](https://github.com/zloirock/core-js/issues/385) yet :/, so you're stuck with some sort of bundler/transpiler (babel, webpack, rollup or parcel...).

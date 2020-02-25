import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import del from "del";

const input = "src/asyncdb.ts"
const extensions = [".js", ".ts"];
const babelConfig = {
  evergreen: {
    extensions,
    presets: [
      [
        "@babel/preset-env",
        {
          targets: { browsers: "> 1% and last 2 versions and not ie <= 11" }
        }
      ],
      "@babel/preset-typescript"
    ]
  },
  support: {
    extensions,
    presets: [
      [
        "@babel/preset-env",
        {
          targets: { browsers: "> .25% and last 4 versions and not ie <= 11" }
        }
      ],
      "@babel/preset-typescript"
    ]
  },
  compat: {
    extensions,
    presets: [
      [
        "@babel/preset-env",
        {
          targets: { browsers: "ie 11" },
          useBuiltIns: "usage",
          corejs: { version: 3, proposals: true }
        }
      ],
      "@babel/preset-typescript"
    ],
    plugins: ["@babel/plugin-proposal-async-generator-functions"]
  }
};

export default async () => {
  await del("dist");
  const builds = [];

  // evergreen esm
  builds.push({
    input,
    plugins: [resolve({ extensions }), babel(babelConfig.evergreen)],
    output: {
      file: "dist/esm.js",
      format: "esm"
    }
  });

  // minified evergreen esm
  builds.push({
    input,
    plugins: [resolve({ extensions }), babel(babelConfig.evergreen), terser()],
    output: {
      file: "dist/esm.min.js",
      format: "esm",
      sourcemap: true
    }
  });

  // minified support es5 iife
  builds.push({
    input,
    plugins: [resolve({ extensions }), babel(babelConfig.support), terser()],
    output: {
      file: "dist/global.support.min.js",
      format: "iife",
      name: "asyncdb",
      exports: "named",
      sourcemap: true
    }
  });

  // minified compat ie es5 iife
  builds.push({
    input,
    plugins: [resolve({ extensions }), babel(babelConfig.compat), terser()],
    output: {
      file: "dist/global.compat.min.js",
      format: "iife",
      name: "asyncdb",
      exports: "named",
      sourcemap: true
    }
  });

  return builds;
};

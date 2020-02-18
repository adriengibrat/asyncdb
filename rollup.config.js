import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
import del from 'del'

const babelConfig = {
	evergreen: {
		presets: [
			[
				'@babel/preset-env',
				{
					targets: { browsers: '> 1% and last 2 versions and not ie <= 11' },
				},
			],
		],
	},
	support: {
		presets: [
			[
				'@babel/preset-env',
				{
					targets: { browsers: '> .25% and last 4 versions and not ie <= 11' },
				}
			],
		],
	},
	compat: {
		presets: [
			[
				'@babel/preset-env',
				{
					targets: { browsers: 'ie 11' },
					useBuiltIns: 'usage',
					corejs: { version: 3, proposals: true }
				},
			],
		],
		plugins: [
				'@babel/plugin-proposal-async-generator-functions',
		],
	},
}

export default async () => {
	await del('dist')
	const builds = []

	// evergreen esm
	builds.push({
		input: 'src/index.js',
		plugins: [
			babel({ babelrc: false, ...babelConfig.evergreen }),
		],
		output: {
				file: 'dist/esm.js',
				format: 'esm',
			}
	})

	// minified evergreen esm
	builds.push({
		input: 'src/index.js',
		plugins: [
			babel({ babelrc: false, ...babelConfig.evergreen }),
			terser(),
		],
		output: {
			file: 'dist/esm.min.js',
			format: 'esm',
			sourcemap: true,
		},
	})

	// minified support es5 iife
	builds.push({
		input: 'src/index.js',
		plugins: [
			babel({ babelrc: false, ...babelConfig.support }),
			terser(),
		],
		output: {
			file: 'dist/global.support.min.js',
			format: 'iife',
			name: 'asyncdb',
			exports: 'named',
			sourcemap: true,
		},
	})

	// minified compat ie es5 iife
	builds.push({
		input: 'src/index.js',
		plugins: [
			babel({ babelrc: false, ...babelConfig.compat }),
			terser(),
		],
		output: {
			file: 'dist/global.compat.min.js',
			format: 'iife',
			name: 'asyncdb',
			exports: 'named',
			sourcemap: true,
		}
	})

	return builds
}
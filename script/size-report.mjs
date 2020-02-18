import { promisify } from 'util'
import { brotliCompress } from 'zlib'
import { promises as fsp } from 'fs'
import glob from 'glob'
import filesize from 'filesize'

const asyncCompress = promisify(brotliCompress)
const asyncGlob = promisify(glob)

!(async () => {
	const paths = await asyncGlob('dist/**/*.js')
	const pad = Math.max(...paths.map(path => path.length))
	const entries = paths.map(async path => {
		const compressed = await asyncCompress(await fsp.readFile(path))
		const { size } = await fsp.stat(path)
		return [path.padEnd(pad), filesize(compressed.length).padStart(8), 'gzipped ',  `(${filesize(size)} ${Math.round((compressed.length - size) / size * 100).toString().padStart(4)}%)`.padStart(16) ]
	})

	for await (const entry of entries) console.log(...entry)
})()

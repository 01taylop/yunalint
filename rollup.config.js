import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'
import { defineConfig } from 'rollup'

const { dependencies, peerDependencies } = JSON.parse(readFileSync(resolve('./package.json'), 'utf-8'))

const COPY_FILES = [
  'config/markdownlint.json',
]

const OUTPUT_DIR = 'lib'

const isExternal = id => [
  ...Object.keys(dependencies || {}),
  ...Object.keys(peerDependencies || {}),
].some(dep => id === dep || id.startsWith(`${dep}/`))

const createConfig = (configFile, format) => ({
  external: isExternal,
  input: configFile,
  output: {
    exports: 'default',
    dir: OUTPUT_DIR,
    format,
  },
  plugins: [
    nodeResolve(),
    typescript(),
  ],
})

export default defineConfig([{
  external: isExternal,
  input: 'src/index.ts',
  output: {
    file: `${OUTPUT_DIR}/index.js`,
    format: 'esm',
  },
  plugins: [
    json(),
    nodeResolve({
      preferBuiltins: true,
    }),
    typescript(),
    terser(),
    copy({
      targets: COPY_FILES.map(file => ({
        dest: OUTPUT_DIR,
        src: file,
      })),
    }),
  ],
},
  createConfig('config/all-legacy.ts', 'cjs'),
  createConfig('config/all.ts', 'esm'),
  createConfig('config/stylelint.config.js', 'cjs'),
])

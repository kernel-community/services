import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodePolyfills from 'rollup-plugin-polyfill-node'

export default {
  input: 'src/index.js',
  // plugins: [json(), nodeResolve({ preferBuiltins: false }), nodePolyfills({ include: null }), commonjs(), esbuild()],
  // plugins: [json(), commonjs(), nodePolyfills({ include: null }), nodeResolve({ preferBuiltins: false })],
  plugins: [json(), commonjs(), nodeResolve({ preferBuiltins: false }), nodePolyfills({ include: null })],
  // plugins: [json(), commonjs(), nodeResolve(), esbuild()],
  output: {
    name: 'evm',
    file: 'dist/build/bundle.js',
    // format: 'iife',
    // format: 'es',
    // format: 'cjs',
    format: 'umd',
    sourcemap: true,
    exports: 'default'
    // plugins: [terser()]
  }
}
/*
    globals: {
      buffer: 'require$$0$4',
      crypto: 'require$$0$3',
      events: 'require$$0$5',
      util: 'require$$1$2',
      tty: 'require$$0$6',
      fs: 'require$$0$7',
      path: 'require$$1$3',
      stream: 'require$$0$8'
    }

*/

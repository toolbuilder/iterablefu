import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'src/chainable.js',
    output: {
      file: 'umd/iterablefu.umd.js',
      sourcemap: true,
      format: 'umd',
      name: 'iterablefu'
    },
    plugins: []
  },
  {
    input: 'src/chainable.js',
    output: {
      file: 'umd/iterablefu.umd.min.js',
      sourcemap: true,
      format: 'umd',
      name: 'iterablefu'
    },
    plugins: [terser()]
  }
]

import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'src/chainable.js',
    output: {
      file: 'bundles/iterablefu.umd.js',
      sourcemap: true,
      format: 'umd',
      name: 'iterablefu'
    },
    plugins: []
  },
  {
    input: 'src/chainable.js',
    output: {
      file: 'bundles/iterablefu.umd.min.js',
      sourcemap: true,
      format: 'umd',
      name: 'iterablefu'
    },
    plugins: [ terser() ]
  }
]

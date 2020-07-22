import multiInput from 'rollup-plugin-multi-input'
import resolve from '@rollup/plugin-node-resolve'
import relativeToPackage from 'rollup-plugin-relative-to-package'
import multiEntry from '@rollup/plugin-multi-entry'

export default [
  // Convert unit tests that import '../src/chainable' to import 'iterablefu'
  // Outputs multiple test files
  {
    input: ['test/**/*test.js'],
    output: {
      format: 'es',
      dir: 'temp'
    },
    plugins: [
      multiInput({ relative: 'test/' }),
      relativeToPackage({
        modulePaths: 'src/**/*.js'
      })
    ]
  },
  // multiInput will not create a single output file, so use multiEntry for that.
  // Create single import file for all converted unit tests
  {
    input: ['temp/**/*test.js'],
    external: ['iterablefu'],
    output: {
      format: 'es',
      file: 'temp/all.js'
    },
    plugins: [
      multiEntry(),
      resolve({
        mainFields: ['module'],
        modulesOnly: true
      })
    ]
  },
  // multiEntry will not create UMD output, so another rollup config for that.
  // Create UMD file that runs all the unit tests, still with iterablefu external
  {
    input: 'temp/all.js',
    external: ['iterablefu'],
    output: {
      file: 'temp/all.umd.js',
      format: 'umd',
      name: 'alltests',
      globals: {
        iterablefu: 'iterablefu' // replace iterablefu import with iterablefu global
      }
    }
  }
]

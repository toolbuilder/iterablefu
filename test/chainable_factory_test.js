import tape from 'tape'
import chainableFactory from '../src/chainable_factory'
import * as Sequences from '../src/sequences'
import * as Transforms from '../src/transforms'
import * as Reducers from '../src/reducers'

// Create some shortened sets of sequences, transforms, and reducers
// to simplify testing.
const sequences = {
  concatenate: Sequences.concatenate,
  range: Sequences.range
}

const transformers = {
  chunk: Transforms.chunk,
  nth: Transforms.nth
}

const reducers = {
  reduce: Reducers.reduce,
  toArray: Reducers.toArray
}

const makeTestRunner = (test) => (parameters) => {
  let [testName, inputIterable, expectedOutput] = parameters
  test.deepEqual(Array.from(inputIterable), expectedOutput, testName)
}

/**
 * The function chainableFactory creates a builder, and a chainable iterable
 * class. The builder returns chainable iterable instances.
 * chainableFactory generates methods for the builder and chainable iterable
 * using the methods in sequences, transformers, and reducers as a starting
 * point.
 * Testing must look at the behavior of the builder and chainable iterable
 * because static validation that the proper methods are present won't
 * verify that the behavior of the generated methods is correct.
 */

const chainable = chainableFactory(sequences, transformers, reducers)
tape('sequences', test => {
  [
    [
      'chainable is callable as a function to create a chainable iterator',
      chainable([0, 1, 2, 3, 4, 5]),
      [0, 1, 2, 3, 4, 5]
    ],
    [
      'Sequences.concatenate was added to chainable',
      chainable.concatenate([0, 1, 2, 3, 4, 5], [6, 7, 8, 9]),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    ],
    [
      'Sequences.range was added to chainable',
      chainable.range(10),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('transforms', test => {
  [
    [
      'Transforms.chunk was added to chainable iterator',
      chainable.range(10).chunk(2),
      [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]
    ],
    [
      'Transforms.nth was added to chainable iterator',
      chainable.range(10).chunk(2).nth(0),
      [0, 2, 4, 6, 8]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('reducers', test => {
  const sum = chainable.range(10).reduce((a, x) => a + x, 0)
  test.deepEqual(sum, 45, 'Reducers.reduce was added to chainable iterator')

  const array = chainable.range(5).toArray()
  test.deepEqual(array, [0, 1, 2, 3, 4], 'Reducers.toArray was added to chainable iterator')
  test.end()
})

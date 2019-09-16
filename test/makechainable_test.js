import { test as tape } from 'zora'
import { makeChainableIterable } from '../src/makechainable.js'
import * as generators from '../src/generators.js'
import * as transforms from '../src/transforms.js'
import * as reducers from '../src/reducers.js'

// Create some shortened sets of generators, transforms, and reducers
// to simplify testing.
const testGenerators = {
  concatenate: generators.concatenate,
  range: generators.range
}

const testTranforms = {
  chunk: transforms.chunk,
  nth: transforms.nth
}

const testReducers = {
  reduce: reducers.reduce,
  toArray: reducers.toArray
}

const makeTestRunner = (test) => (parameters) => {
  const { name, actual, expected } = parameters
  test.deepEqual(Array.from(actual), expected, name)
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

const chainable = makeChainableIterable(testGenerators, testTranforms, testReducers)

tape('sequences', test => {
  [
    {
      name: 'chainable is callable as a function to create a chainable iterator',
      actual: chainable([0, 1, 2, 3, 4, 5]),
      expected: [0, 1, 2, 3, 4, 5]
    },
    {
      name: 'Sequences.concatenate was added to chainable',
      actual: chainable.concatenate([0, 1, 2, 3, 4, 5], [6, 7, 8, 9]),
      expected: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    {
      name: 'Sequences.range was added to chainable',
      actual: chainable.range(10),
      expected: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
  ].forEach(makeTestRunner(test))
})

tape('transforms', test => {
  [
    {
      name: 'Transforms.chunk was added to chainable iterator',
      actual: chainable.range(10).chunk(2),
      expected: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]
    },
    {
      name: 'Transforms.nth was added to chainable iterator',
      actual: chainable.range(10).chunk(2).nth(0),
      expected: [0, 2, 4, 6, 8]
    }
  ].forEach(makeTestRunner(test))
})

tape('reducers', test => {
  const sum = chainable.range(10).reduce((a, x) => a + x, 0)
  test.deepEqual(sum, 45, 'Reducers.reduce was added to chainable iterator')

  const array = chainable.range(5).toArray()
  test.deepEqual(array, [0, 1, 2, 3, 4], 'Reducers.toArray was added to chainable iterator')
})

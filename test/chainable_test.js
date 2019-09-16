import { test as tape } from 'zora'
import {
  chainable,
  ChainableIterable,
  makeChainableClass,
  makeChainableIterable,
  generators,
  transforms,
  reducers
} from '../src/chainable.js'

const makeTestRunner = (test) => (parameters) => {
  const { name, actual, expected } = parameters
  test.deepEqual(actual, expected, name)
}

tape('chainable', test => {
  // chainable was created with a chainable factory that is already tested
  // These tests are just to verify that the chainable factory was used correctly,
  // Therefore they are cursory checks.
  [
    {
      name: 'when called as function returns instance of ChainableIterable',
      actual: chainable([]) instanceof ChainableIterable,
      expected: true
    },
    {
      name: 'has expected generator methods',
      actual: [...Object.keys(chainable)].sort(),
      expected: [...Object.keys(generators)].sort()
    },
    {
      name: 'generator methods return ChainableIterable',
      actual: chainable.repeat(3, 'a') instanceof ChainableIterable,
      expected: true
    }
  ].forEach(makeTestRunner(test))

  // simple generator to test with, copied from MDN
  function * makeRangeIterator (start = 0, end = 10, step = 1) {
    for (let i = start; i < end; i += step) {
      yield i
    }
  }

  test.deepEqual([...chainable(makeRangeIterator(0, 5))], [0, 1, 2, 3, 4], 'chainable works with iterators')
})

tape('ChainableIterable', test => {
  // chainable uses ChainableIterable, so there's little left to test...
  [
    {
      name: 'has all static methods',
      actual: [...Object.keys(ChainableIterable)],
      expected: [...Object.keys(generators)]
    },
    {
      name: 'has all transform and reducer methods',
      actual: [...Object.keys(ChainableIterable.prototype)],
      expected: [...Object.keys(transforms), ...Object.keys(reducers)]
    },
    {
      name: 'supports new',
      actual: [...(new ChainableIterable([1, 2, 3]))],
      expected: [1, 2, 3]
    },
    {
      name: 'has static chainable constructor method',
      actual: [...ChainableIterable.from([1, 2, 3])],
      expected: [1, 2, 3]
    }
  ].forEach(makeTestRunner(test))
})

tape('makeChainableClass', test => {
  // Just making sure this is makeChainableClass from '../src/makechainable.js'
  // This class functions identically to ChainableIterable
  const Chainable = makeChainableClass(generators, transforms, reducers)
  test.deepEqual([...new Chainable([1, 2, 3])], [1, 2, 3], 'makes a chainable iterable class')
})

tape('makeChainableIterable', test => {
  // Just making sure this is makeChainableIterable from '../src/makechainable.js'
  // This object functions identically to chainable
  const ChainableFunc = makeChainableIterable(generators, transforms, reducers)
  test.deepEqual([...ChainableFunc([1, 2, 3])], [1, 2, 3], 'makes a Chainable function')
})

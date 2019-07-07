import tape from 'tape'
import { chainable, customBuilder } from '../src/chainable'
import * as sequences from '../src/sequences'
import * as transforms from '../src/transforms'
import * as reducers from '../src/reducers'

const makeTestRunner = (test) => (parameters) => {
  let { name, actual, expected } = parameters
  test.deepEqual(actual, expected, name)
}

tape('chainable', test => {
  // chainable was created with a chainable factory that is already tested
  // These tests are just to verify that the chainable factory was used correctly,
  // Therefore they are cursory checks.
  [
    {
      name: 'when called as function returns instance of chainable.Chainable',
      actual: chainable([]) instanceof chainable.Chainable,
      expected: true
    },
    {
      name: 'has expected sequence generator methods',
      actual: [...Object.keys(chainable)].sort(),
      expected: ['Chainable', ...Object.keys(sequences)].sort()
    },
    {
      name: 'sequence generator methods return chainable.Chainable',
      actual: chainable.repeat(3, 'a') instanceof chainable.Chainable,
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

  test.end()
})

tape('chainable.Chainable', test => {
  [
    {
      name: 'chainable.Chainable has all transform and reducer methods',
      actual: [...Object.keys(chainable.Chainable.prototype)],
      expected: [...Object.keys(transforms), ...Object.keys(reducers)]
    },
    {
      name: 'chainable.Chainable is iterable',
      actual: [...(new chainable.Chainable([1, 2, 3]))],
      expected: [1, 2, 3]
    },
    {
      name: 'chainable.Chainable transforms return chainable.Chainable instance',
      actual: new chainable.Chainable([1, 2, 3]).map(x => 2 * x) instanceof chainable.Chainable,
      expected: true
    }
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('customBuilder properties', test => {
  [
    {
      name: 'has sequences, transforms, and reducers properties',
      actual: [...Object.keys(customBuilder)].sort(),
      expected: ['sequences', 'transforms', 'reducers'].sort()
    },
    {
      name: 'customBuilder.sequences has full set of default sequences',
      actual: [...Object.keys(customBuilder.sequences)].sort(),
      expected: [...Object.keys(sequences)].sort()
    },
    {
      name: 'customBuilder.transforms has full set of default sequences',
      actual: [...Object.keys(customBuilder.transforms)].sort(),
      expected: [...Object.keys(transforms)].sort()
    },
    {
      name: 'customBuilder.reducers has full set of default sequences',
      actual: [...Object.keys(customBuilder.reducers)].sort(),
      expected: [...Object.keys(reducers)].sort()
    }
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('custom chainable iterator built by customBuilder', test => {
  // Create sequences, transforms and reducers to create a custom chainable iterator with
  const customSequences = {
    fibonacci: n => {
      return {
        * [Symbol.iterator] () {
          let count = n
          let current = 0
          let next = 1

          while (count--) {
            yield current;
            [current, next] = [next, current + next]
          }
        }
      }
    }
  }

  const customTransforms = {
    squared: (iterable) => {
      return {
        * [Symbol.iterator] () {
          for (let x of iterable) {
            yield x * x
          }
        }
      }
    }
  }
  const customReducers = {
    'sum': (iterable) => {
      let sum = 0
      for (let x of iterable) {
        sum += x
      }
      return sum
    }
  }
  // Create a custom chainable iterator to test customBuilder
  const custom = customBuilder(customSequences, customTransforms, customReducers);
  [
    {
      name: 'when called as function returns instance of custom.Chainable',
      actual: custom([1, 2, 3]) instanceof custom.Chainable,
      expected: true
    },
    {
      name: 'has expected sequence generator methods',
      actual: [...Object.keys(custom)].sort(),
      expected: ['Chainable', ...Object.keys(customSequences)].sort()
    },
    {
      name: 'custom.Chainable has all transform and reducer properties',
      actual: [...Object.keys(custom.Chainable.prototype)].sort(),
      expected: [...Object.keys(customTransforms), ...Object.keys(customReducers)].sort()
    },
    {
      name: 'custom.Chainable is iterable',
      actual: [...(new custom.Chainable(['a', 'b']))],
      expected: ['a', 'b']
    },
    {
      name: 'custom.Chainable transforms return custom.Chainable instance',
      actual: custom([0, 1, 2, 3, 4]).squared() instanceof custom.Chainable,
      expected: true
    },
    {
      name: 'custom.Chainable reducer (the sum method) works',
      actual: custom([0, 1, 2, 3, 4]).sum(),
      expected: 10
    }
  ].forEach(makeTestRunner(test))
  test.end()
})

import tape from 'tape'
import { chainable, customBuilder } from './chainable.mjs'
import sequences from './sequences'
import transforms from './transforms'
import reducers from './reducers'

const makeTestRunner = (test) => (parameters) => {
  let [testName, inputIterable, expectedOutput] = parameters
  test.deepEqual(Array.from(inputIterable), expectedOutput, testName)
}

const checkBasicCapabilities = (chainable, test) => {
  // Just need simplified testing since the underlying implementation
  // has already been thoroughly tested.
  [
    [
      'is callable with iterator',
      chainable([5, 6, 7, 8]),
      [5, 6, 7, 8]
    ],
    [
      'has chainable sequences',
      chainable.repeat(3, 'a'),
      ['a', 'a', 'a']
    ],
    [
      'has transforms',
      chainable([0, 1, 2, 3, 4]).map(x => 2 * x),
      [0, 2, 4, 6, 8]
    ]
  ].forEach(makeTestRunner(test))

  test.deepEqual(chainable([0, 1, 2, 3, 4]).toArray(), [0, 1, 2, 3, 4], 'has reducers')
}

const checkProperties = (name, object, expectedKeys, test) => {
  const actualKeys = [...Object.keys(object)]
  actualKeys.sort()
  expectedKeys.sort()
  test.deepEqual(actualKeys, expectedKeys, `${name} has expected properties`)
}

tape('chainable', test => {
  checkBasicCapabilities(chainable, test)
  checkProperties('chainable', chainable, ['Chainable', ...Object.keys(sequences)], test)
  checkProperties(
    'chainable iterable',
    chainable.Chainable.prototype,
    [...Object.keys(transforms), ...Object.keys(reducers)],
    test)
  test.end()
})

tape('customBuilder properties', test => {
  checkProperties('customBuilder', customBuilder, ['sequences', 'transforms', 'reducers'], test)
  checkProperties('customBuilder.sequences', customBuilder.sequences, [...Object.keys(sequences)], test)
  checkProperties('customBuilder.transforms', customBuilder.transforms, [...Object.keys(transforms)], test)
  checkProperties('customBuilder.reducers', customBuilder.reducers, [...Object.keys(reducers)], test)
  test.end()
})

tape('customBuilder created chainable iterator', test => {
  const sequences = {
    repeat: (n, thing) => {
      return {
        * [Symbol.iterator] () {
          for (let i = 0; i < n; i++) {
            yield thing
          }
        }
      }
    }
  }

  const transforms = {
    map: (fn, iterable) => {
      return {
        * [Symbol.iterator] () {
          for (let value of iterable) {
            yield fn(value)
          }
        }
      }
    }
  }
  const reducers = {
    'toArray': (iterable) => Array.from(iterable)
  }
  const custom = customBuilder(sequences, transforms, reducers)
  checkBasicCapabilities(custom, test)
  checkProperties('custom builder', custom, ['Chainable', 'repeat'], test)
  checkProperties('custom chainable', custom.Chainable.prototype, ['map', 'toArray'], test)
  test.end()
})

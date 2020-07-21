import { test as tape } from 'zora'
import { generators, transforms } from '../src/chainable'

const isEvenNumber = x => x % 2 === 0

// The last parameter of all transforms is 'iterable'.
// Effectively curry the transforms to make test parameters vs input iterable clearer
const curried = {}
for (const methodName in transforms) {
  curried[methodName] = (...args) => (iterable) => transforms[methodName](...args, iterable)
}

const makeTestRunner = (test) => (parameters) => {
  const [testName, inputIterable, iterableFactory, expectedOutput] = parameters
  const iterable = iterableFactory(inputIterable)
  test.deepEqual(Array.from(iterable), expectedOutput, testName)
}

tape('arrayToObject', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'converts sequence of arrays to sequence of objects',
      [['George', 22], ['Betty', 18], ['Grandpa', 89], ['Sally', 42]],
      curried.arrayToObject(['name', 'age']),
      [
        { name: 'George', age: 22 },
        { name: 'Betty', age: 18 },
        { name: 'Grandpa', age: 89 },
        { name: 'Sally', age: 42 }
      ]
    ],
    [
      'properties with no matching array element are set to undefined',
      [['George'], ['Betty', 18], ['Grandpa'], ['Sally', 42]],
      curried.arrayToObject(['name', 'age']),
      [
        { name: 'George', age: undefined },
        { name: 'Betty', age: 18 },
        { name: 'Grandpa', age: undefined },
        { name: 'Sally', age: 42 }
      ]
    ],
    [
      'arrays with no matching property are ignored',
      [['George', 22, 45], ['Betty', 18, 63], ['Grandpa', 89], ['Sally', 42]],
      curried.arrayToObject(['name', 'age']),
      [
        { name: 'George', age: 22 },
        { name: 'Betty', age: 18 },
        { name: 'Grandpa', age: 89 },
        { name: 'Sally', age: 42 }
      ]
    ]
  ].forEach(makeTestRunner(test))
})

tape('chunk', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'can generate all full length chunks',
      generators.range(12),
      curried.chunk(3),
      [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]]
    ],
    [
      'can generate partial chunk at end',
      generators.range(13),
      curried.chunk(3),
      [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12]]
    ],
    [
      'empty input iterable outputs no chunks',
      [],
      curried.chunk(3),
      []
    ]
  ].forEach(makeTestRunner(test))
})

tape('diff', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'calls fn(previous, current) for each item pair',
      generators.range(5),
      curried.diff((n, m) => m - n),
      [1, 1, 1, 1]
    ],
    [
      'zero length input returns zero length output',
      [],
      curried.diff((n, m) => m - n),
      []
    ],
    [
      'one input value returns zero length output',
      [1],
      curried.diff((n, m) => m - n),
      []
    ]

  ].forEach(makeTestRunner(test))
})

tape('filter', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'removes elements from sequence when function returns !truthy',
      generators.range(10),
      curried.filter(isEvenNumber),
      Array.from(generators.range(0, 5, 2))
    ],
    [
      'passes all elements when function only returns truthy values',
      generators.range(10),
      curried.filter(() => true),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    ]
  ].forEach(makeTestRunner(test))
})

tape('flatten', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'does not recurse',
      [0, [1, 2, 3], [4, 5, 6], [['a', 'b'], 7], 8, 9],
      curried.flatten(),
      [0, 1, 2, 3, 4, 5, 6, ['a', 'b'], 7, 8, 9]
    ],
    [
      'does not flatten strings',
      ['Chainable', 'Iterable', 'Sequence', 'Generator', 'Transform'],
      curried.flatten(),
      ['Chainable', 'Iterable', 'Sequence', 'Generator', 'Transform']
    ]
  ].forEach(makeTestRunner(test))
})

tape('flattenRecursive', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'recursively flattens iterable',
      [0, [1, 2, 3], [[4, 5], [[[6, 7]], [8, 9], 10]], 11, 12],
      curried.flattenRecursive(),
      Array.from(generators.range(13))
    ],
    [
      'does not flatten strings',
      ['Chainable', ['Iterable', ['Sequence', 'Generator']], String('Transform')],
      curried.flattenRecursive(),
      ['Chainable', 'Iterable', 'Sequence', 'Generator', 'Transform']
    ]
  ].forEach(makeTestRunner(test))
})

tape('map', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'generates each output value using provided function',
      generators.range(5),
      curried.map(x => 3 * x),
      [0, 3, 6, 9, 12]
    ]
  ].forEach(makeTestRunner(test))
})

const mapWithGenerator = function * (iterable) {
  for (const x of iterable) {
    yield x * x
  }
}

tape('mapWith', test => {
  [
    [
      'generates each output value using the provided generator function',
      generators.range(5),
      curried.mapWith(mapWithGenerator),
      [0, 1, 4, 9, 16]
    ]
  ].forEach(makeTestRunner(test))
})

tape('pluck', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'yields specified property from each object',
      transforms.arrayToObject(['named', 'numbered'],
        generators.zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5])),
      curried.pluck('named'),
      ['able', 'better', 'chainable', 'dictionary', 'enhanced']
    ],
    [
      'returns undefined when property is undefined',
      transforms.arrayToObject(['named', 'numbered'],
        generators.zipAll(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5, 6])),
      curried.pluck('named'),
      ['able', 'better', 'chainable', 'dictionary', 'enhanced', undefined]
    ]
  ].forEach(makeTestRunner(test))
})

tape('nth', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'positive index returns that element of the array',
      generators.zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10]),
      curried.nth(1),
      Array.from(generators.range(1, 5))
    ],
    [
      'negative index returns values from the end, -1 returns the last value',
      generators.zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10]),
      curried.nth(-1),
      Array.from(generators.range(6, 5))
    ]
  ].forEach(makeTestRunner(test))
})

tape('reject', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'removes elements when function returns truthy',
      generators.range(10),
      curried.reject(isEvenNumber),
      [1, 3, 5, 7, 9]
    ]
  ].forEach(makeTestRunner(test))
})

tape('take', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'returns the first n elements of iterable',
      generators.range(10),
      curried.take(5),
      Array.from(generators.range(5))
    ],
    [
      'takes entire iterable if less than n elements',
      generators.range(3),
      curried.take(5),
      Array.from(generators.range(3))
    ],
    [
      'handles zero length iterable',
      [],
      curried.take(5),
      []
    ]
  ].forEach(makeTestRunner(test))
})

tape('takeWhile', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'returns elements until function returns !truthy, then stops',
      generators.range(10),
      curried.takeWhile(x => x !== 5),
      Array.from(generators.range(5))
    ]
  ].forEach(makeTestRunner(test))
})

tape('tap', test => {
  const accumulator = []
  const inputSequence = generators.range(10)
  const iterable = transforms.tap(x => accumulator.push(2 * x), inputSequence)
  test.deepEqual(Array.from(iterable), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'does not modify sequence')
  test.deepEqual(accumulator, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18], 'executes function for each element')
})

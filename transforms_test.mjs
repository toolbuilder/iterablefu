import tape from 'tape'
import Sequences from './sequences'
import Transforms from './transforms'

const isEvenNumber = x => x % 2 === 0
const isIterable = (item) => item && typeof item[Symbol.iterator] === 'function'

// Dynamically create factory methods for each transform to make test data cleaner.
// Each factory method has the same name as the associated factory
const factory = {}
for (let methodName in Transforms) {
  factory[methodName] = (...args) => (iterable) => Transforms[methodName](...args, iterable)
}

const makeTestRunner = (test) => (parameters) => {
  let [testName, inputIterable, iterableFactory, expectedOutput] = parameters
  const iterable = iterableFactory(inputIterable)
  test.deepEqual(Array.from(iterable), expectedOutput, testName)
}

tape('arrayToObject', test => {
  [
    // format: [testName, inputIterable, iterableFactory, expectedOutput]
    [
      'converts sequence of arrays to sequence of objects',
      [['George', 22], ['Betty', 18], ['Grandpa', 89], ['Sally', 42]],
      factory.arrayToObject(['name', 'age']),
      [
        { 'name': 'George', 'age': 22 },
        { 'name': 'Betty', 'age': 18 },
        { 'name': 'Grandpa', 'age': 89 },
        { 'name': 'Sally', 'age': 42 }
      ]
    ],
    [
      'properties with no matching array element are set to undefined',
      [['George'], ['Betty', 18], ['Grandpa'], ['Sally', 42]],
      factory.arrayToObject(['name', 'age']),
      [
        { 'name': 'George', 'age': undefined },
        { 'name': 'Betty', 'age': 18 },
        { 'name': 'Grandpa', 'age': undefined },
        { 'name': 'Sally', 'age': 42 }
      ]
    ],
    [
      'arrays with no matching property are ignored',
      [['George', 22, 45], ['Betty', 18, 63], ['Grandpa', 89], ['Sally', 42]],
      factory.arrayToObject(['name', 'age']),
      [
        { 'name': 'George', 'age': 22 },
        { 'name': 'Betty', 'age': 18 },
        { 'name': 'Grandpa', 'age': 89 },
        { 'name': 'Sally', 'age': 42 }
      ]
    ],
    [
      'all properties are set to undefined if array is undefined ',
      [['George', 22], undefined, ['Betty', 18], ['Grandpa', 89], ['Sally', 42]],
      factory.arrayToObject(['name', 'age']),
      [
        { 'name': 'George', 'age': 22 },
        { 'name': undefined, 'age': undefined },
        { 'name': 'Betty', 'age': 18 },
        { 'name': 'Grandpa', 'age': 89 },
        { 'name': 'Sally', 'age': 42 }
      ]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('chunk', test => {
  [
    [
      'can generate all full length chunks',
      Sequences.range(12),
      factory.chunk(3),
      [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]]
    ],
    [
      'can generate partial chunk at end',
      Sequences.range(13),
      factory.chunk(3),
      [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12]]
    ],
    [
      'empty input iterable outputs no chunks',
      [],
      factory.chunk(3),
      []
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('filter', test => {
  [
    [
      'removes elements from sequence when function returns !truthy',
      Sequences.range(10),
      factory.filter(isEvenNumber),
      Array.from(Sequences.range(0, 5, 2))
    ],
    [
      'passes all elements when function only returns truthy values',
      Sequences.range(10),
      factory.filter(x => true),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('flatten', test => {
  [
    [
      'does not recurse',
      [0, [1, 2, 3], [4, 5, 6], [['a', 'b'], 7], 8, 9],
      factory.flatten(),
      [0, 1, 2, 3, 4, 5, 6, ['a', 'b'], 7, 8, 9]
    ],
    [
      'does not flatten strings',
      ['Chainable', 'Iterable', 'Sequence', 'Generator', 'Transform'],
      factory.flatten(),
      ['Chainable', 'Iterable', 'Sequence', 'Generator', 'Transform']
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('flattenPerFunction', test => {
  [
    [
      'uses function to determine yield value, and whether to iterate it',
      [0, [1, 2, 3], [4, 5, 6], [['a', 'b'], 7], 8, 9],
      // this is a simplified version of flatten that will flatten strings
      factory.flattenPerFunction(x => ({ iterate: isIterable(x), itemToYield: x })),
      [0, 1, 2, 3, 4, 5, 6, ['a', 'b'], 7, 8, 9]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('flattenRecursive', test => {
  [
    [
      'recursively flattens iterable',
      [0, [1, 2, 3], [[4, 5], [[[6, 7]], [8, 9], 10]], 11, 12],
      factory.flattenRecursive(),
      Array.from(Sequences.range(13))
    ],
    [
      'does not flatten strings',
      ['Chainable', ['Iterable', ['Sequence', 'Generator']], String('Transform')],
      factory.flattenRecursive(),
      ['Chainable', 'Iterable', 'Sequence', 'Generator', 'Transform']
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('map', test => {
  [
    [
      'generates each output value using provided function',
      Sequences.range(5),
      factory.map(x => 3 * x),
      [0, 3, 6, 9, 12]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('pluck', test => {
  [
    [
      'yields specified property from each object',
      Transforms.arrayToObject(['named', 'numbered'],
        Sequences.zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5])),
      factory.pluck('named'),
      ['able', 'better', 'chainable', 'dictionary', 'enhanced']
    ],
    [
      'returns undefined when property is undefined',
      Transforms.arrayToObject(['named', 'numbered'],
        Sequences.zipAll(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5, 6])),
      factory.pluck('named'),
      ['able', 'better', 'chainable', 'dictionary', 'enhanced', undefined]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('nth', test => {
  [
    [
      'positive index returns that element of the array',
      Sequences.zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10]),
      factory.nth(1),
      Array.from(Sequences.range(1, 5))
    ],
    [
      'negative index returns values from the end, -1 returns the last value',
      Sequences.zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10]),
      factory.nth(-1),
      Array.from(Sequences.range(6, 5))
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('reject', test => {
  [
    [
      'removes elements when function returns truthy',
      Sequences.range(10),
      factory.reject(isEvenNumber),
      [1, 3, 5, 7, 9]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('take', test => {
  [
    [
      'returns the first n elements of iterable',
      Sequences.range(10),
      factory.take(5),
      Array.from(Sequences.range(5))
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('takeWhile', test => {
  [
    [
      'returns elements until function returns !truthy, then stops',
      Sequences.range(10),
      factory.takeWhile(x => x !== 5),
      Array.from(Sequences.range(5))
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('tap', test => {
  const accumulator = []
  const inputSequence = Sequences.range(10)
  const iterable = Transforms.tap(x => accumulator.push(2 * x), inputSequence)
  test.deepEqual(Array.from(iterable), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'does not modify sequence')
  test.deepEqual(accumulator, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18], 'executes function for each element')
  test.end()
})

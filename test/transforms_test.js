import tape from 'tape'
import * as sequences from '../src/sequences.js'
import * as transforms from '../src/transforms.js'

const isEvenNumber = x => x % 2 === 0
const isIterable = (item) => item && typeof item[Symbol.iterator] === 'function'

// The last parameter of all transforms is 'iterable'.
// Effectively curry the transforms to make test parameters vs input iterable clearer
const curried = {}
for (let methodName in transforms) {
  curried[methodName] = (...args) => (iterable) => transforms[methodName](...args, iterable)
}

const makeTestRunner = (test) => (parameters) => {
  let [testName, inputIterable, iterableFactory, expectedOutput] = parameters
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
        { 'name': 'George', 'age': 22 },
        { 'name': 'Betty', 'age': 18 },
        { 'name': 'Grandpa', 'age': 89 },
        { 'name': 'Sally', 'age': 42 }
      ]
    ],
    [
      'properties with no matching array element are set to undefined',
      [['George'], ['Betty', 18], ['Grandpa'], ['Sally', 42]],
      curried.arrayToObject(['name', 'age']),
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
      curried.arrayToObject(['name', 'age']),
      [
        { 'name': 'George', 'age': 22 },
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
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'can generate all full length chunks',
      sequences.range(12),
      curried.chunk(3),
      [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]]
    ],
    [
      'can generate partial chunk at end',
      sequences.range(13),
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
  test.end()
})

tape('filter', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'removes elements from sequence when function returns !truthy',
      sequences.range(10),
      curried.filter(isEvenNumber),
      Array.from(sequences.range(0, 5, 2))
    ],
    [
      'passes all elements when function only returns truthy values',
      sequences.range(10),
      curried.filter(x => true),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
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
  test.end()
})

tape('flattenPerFunction', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'uses function to determine yield value, and whether to iterate it',
      [0, [1, 2, 3], [4, 5, 6], [['a', 'b'], 7], 8, 9],
      // this is a simplified version of flatten that will flatten strings
      curried.flattenPerFunction(x => ({ iterate: isIterable(x), itemToYield: x })),
      [0, 1, 2, 3, 4, 5, 6, ['a', 'b'], 7, 8, 9]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('flattenRecursive', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'recursively flattens iterable',
      [0, [1, 2, 3], [[4, 5], [[[6, 7]], [8, 9], 10]], 11, 12],
      curried.flattenRecursive(),
      Array.from(sequences.range(13))
    ],
    [
      'does not flatten strings',
      ['Chainable', ['Iterable', ['Sequence', 'Generator']], String('Transform')],
      curried.flattenRecursive(),
      ['Chainable', 'Iterable', 'Sequence', 'Generator', 'Transform']
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('map', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'generates each output value using provided function',
      sequences.range(5),
      curried.map(x => 3 * x),
      [0, 3, 6, 9, 12]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('pluck', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'yields specified property from each object',
      transforms.arrayToObject(['named', 'numbered'],
        sequences.zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5])),
      curried.pluck('named'),
      ['able', 'better', 'chainable', 'dictionary', 'enhanced']
    ],
    [
      'returns undefined when property is undefined',
      transforms.arrayToObject(['named', 'numbered'],
        sequences.zipAll(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5, 6])),
      curried.pluck('named'),
      ['able', 'better', 'chainable', 'dictionary', 'enhanced', undefined]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('nth', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'positive index returns that element of the array',
      sequences.zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10]),
      curried.nth(1),
      Array.from(sequences.range(1, 5))
    ],
    [
      'negative index returns values from the end, -1 returns the last value',
      sequences.zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10]),
      curried.nth(-1),
      Array.from(sequences.range(6, 5))
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('reject', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'removes elements when function returns truthy',
      sequences.range(10),
      curried.reject(isEvenNumber),
      [1, 3, 5, 7, 9]
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('take', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'returns the first n elements of iterable',
      sequences.range(10),
      curried.take(5),
      Array.from(sequences.range(5))
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('takeWhile', test => {
  [
    // format: [testName, inputIterable, curried transform, expectedOutput]
    [
      'returns elements until function returns !truthy, then stops',
      sequences.range(10),
      curried.takeWhile(x => x !== 5),
      Array.from(sequences.range(5))
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('tap', test => {
  const accumulator = []
  const inputSequence = sequences.range(10)
  const iterable = transforms.tap(x => accumulator.push(2 * x), inputSequence)
  test.deepEqual(Array.from(iterable), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'does not modify sequence')
  test.deepEqual(accumulator, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18], 'executes function for each element')
  test.end()
})

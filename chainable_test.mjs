import tape from 'tape'
import FunctionalIterables from './chainable.mjs'

const fi = FunctionalIterables.builder()

// This function remembers to call end() for each test
const tapetest = (title, testfunction) => {
  tape(title, test => {
    testfunction(test)
    test.end()
  })
}

// Test an iterable.
// Format of testParameters is:
// [
//   testName, // name of the test as output by tape
//   iterableUnderTest, // the chainable iterable to be tested
//   expectedOuputAsArray // an array that is equivalent to the expected output of iterableUnderTest
// ]
const runTest = (testParameters) => {
  let [testName, iterableUnderTest, expectedOuputAsArray] = testParameters
  tapetest(testName, test => {
    iterableUnderTest.map(x => x) // tack on a no-op transform to ensure iterable is chainable
    test.deepEqual(Array.from(iterableUnderTest), expectedOuputAsArray)
  })
}

// TEST: range
// The range method works like Python ranges. Each row describes a test.
fi([
  // [ partialTitle, inputArgs, equivalentInputArgs, expectedOutputAsArray]
  ['zero arguments', [], [0, 0, 1], []],
  ['one argument', [5], [0, 5, 1], [0, 1, 2, 3, 4]],
  ['two arguments', [2, 5], [2, 5, 1], [2, 3, 4, 5, 6]],
  ['three arguments', [2, 5, 3], [2, 5, 3], [2, 5, 8, 11, 14]],
  ['four arguments', [2, 5, 3, 6], [2, 5, 3], [2, 5, 8, 11, 14]]
]).map(x => {
  // [testName, iterableUnderTest, expectedOuputAsArray]
  const testName = x[0]
  const expectedOuputAsArray = x[3]
  return [
    [`range test with ${testName}`, fi.range(...(x[1])), expectedOuputAsArray],
    [`range test as if with ${testName}`, fi.range(...(x[2])), expectedOuputAsArray]
  ]
}).flatten().forEach(runTest)

// TEST: zip and zipAll
const iterableOne = ['able', 'better', 'chainable', 'dictionary', 'enhanced', 'cherry']
const iterableRef = [['able', 1], ['better', 2], ['chainable', 3], ['dictionary', 4], ['enhanced', 5]]
fi([
  // [testName, iterableUnderTest, expectedOuputAsArray]
  [
    'zip equal length iterables',
    fi.zip(iterableOne.slice(0, 5), fi.range(1, 5)),
    iterableRef
  ],
  [
    'zip unequal length iterables',
    fi.zip(iterableOne, fi.range(1, 5)),
    iterableRef
  ],
  [
    'zipAll equal length iterables',
    fi.zipAll(iterableOne.slice(0, 5), fi.range(1, 5)),
    iterableRef
  ],
  [
    'zipAll unequal length iterables',
    fi.zipAll(iterableOne, fi.range(1, 5)),
    fi.concatenate(iterableRef, [['cherry', undefined]]).toArray()
  ]
]).forEach(runTest)

// TEST: fi(iterable), fi.concatenate(...iterables), fi.repeat(n, thing)
fi([
  // [testName, iterableUnderTest, expectedOuputAsArray]
  [
    'function call construction',
    fi(fi.range(10)),
    fi.range(10).toArray()
  ],
  [
    'concatenated input iterables',
    fi.concatenate([0, 1, 2, 3, 4], [5, 6, 7], [8, 9]),
    fi.range(10).toArray()
  ],
  [
    'repeat',
    fi.repeat(10, 'apples'),
    fi.range(10).map(x => 'apples').toArray()
  ]
]
).forEach(runTest)

// TEST: transforms
const isEvenNumber = x => x % 2 === 0
const isIterable = (item) => item && typeof item[Symbol.iterator] === 'function'
fi([
  // [testName, iterableUnderTest, expectedOuputAsArray]
  [
    'arrayToObject',
    fi([['George', 22], ['Betty', 18], ['Grandpa', 89], ['Sally', 42]]).arrayToObject(['name', 'age']),
    [
      { 'name': 'George', 'age': 22 },
      { 'name': 'Betty', 'age': 18 },
      { 'name': 'Grandpa', 'age': 89 },
      { 'name': 'Sally', 'age': 42 }
    ]
  ],
  [
    'arrayToObject with too few values for some object',
    fi([['George'], ['Betty', 18], ['Grandpa'], ['Sally', 42]]).arrayToObject(['name', 'age']),
    [
      { 'name': 'George', 'age': undefined },
      { 'name': 'Betty', 'age': 18 },
      { 'name': 'Grandpa', 'age': undefined },
      { 'name': 'Sally', 'age': 42 }
    ]
  ],
  [
    'arrayToObject with too many values for some objects',
    fi([['George', 22, 45], ['Betty', 18, 63], ['Grandpa', 89], ['Sally', 42]]).arrayToObject(['name', 'age']),
    [
      { 'name': 'George', 'age': 22 },
      { 'name': 'Betty', 'age': 18 },
      { 'name': 'Grandpa', 'age': 89 },
      { 'name': 'Sally', 'age': 42 }
    ]
  ],
  [
    'chunk with all complete chunks',
    fi.range(12).chunk(3),
    [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]]
  ],
  [
    'chunk with partial chunk at end',
    fi.range(13).chunk(3),
    [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12]]
  ],
  [
    'chunk with empty input iterable',
    fi.range(0).chunk(3),
    []
  ],
  [
    'filter',
    fi.range(10).filter(isEvenNumber),
    fi.range(0, 5, 2).toArray()
  ],
  [
    'flatten does not recurse',
    fi([0, [1, 2, 3], [4, 5, 6], [['a', 'b'], 7], 8, 9]).flatten(),
    [0, 1, 2, 3, 4, 5, 6, ['a', 'b'], 7, 8, 9]
  ],
  [
    'flatten does not flatten strings',
    fi(['Chainable', 'Iterable', 'Sequence', 'Generator', 'Transform']).flatten(),
    ['Chainable', 'Iterable', 'Sequence', 'Generator', 'Transform']
  ],
  [
    'flattenPerFunction',
    fi([0, [1, 2, 3], [4, 5, 6], [['a', 'b'], 7], 8, 9])
      .flattenPerFunction(x => ({ iterate: isIterable(x), itemToYield: x })),
    [0, 1, 2, 3, 4, 5, 6, ['a', 'b'], 7, 8, 9]
  ],
  [
    'flattenRecursive does recurse',
    fi([0, [1, 2, 3], [[4, 5], [[[6, 7]], [8, 9], 10]], 11, 12]).flattenRecursive(),
    fi.range(13).toArray()
  ],
  [
    'flattenRecursive should not flatten strings',
    fi(['Chainable', ['Iterable', ['Sequence', 'Generator']], 'Transform']).flattenRecursive(),
    ['Chainable', 'Iterable', 'Sequence', 'Generator', 'Transform']
  ],
  [
    'map',
    fi.range(5).map(x => 3 * x),
    [0, 3, 6, 9, 12]
  ],
  [
    'pluck',
    fi
      .zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5])
      .arrayToObject(['named', 'numbered'])
      .pluck('named'),
    ['able', 'better', 'chainable', 'dictionary', 'enhanced']
  ],
  [
    'nth with positive index',
    fi
      .zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10])
      .nth(1),
    fi.range(1, 5).toArray()
  ],
  [
    'nth with negative index',
    fi
      .zip(['able', 'better', 'chainable', 'dictionary', 'enhanced'], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10])
      .nth(-1),
    fi.range(6, 5).toArray()
  ],
  [
    'reject',
    fi.range(10).reject(isEvenNumber),
    [1, 3, 5, 7, 9]
  ],
  [
    'take',
    fi.range(10).take(5),
    fi.range(5).toArray()
  ],
  [
    'takeWhile',
    fi.range(10).takeWhile(x => x < 5),
    fi.range(5).toArray()
  ]
]).forEach(runTest)

tapetest('tap', test => {
  const accumulator = []
  const iterable = fi.range(10).tap(x => accumulator.push(2 * x))
  test.deepEqual(iterable.toArray(), fi.range(10).toArray()) // stream not modified
  test.deepEqual(accumulator, fi.range(10).map(x => 2 * x).toArray()) // side effects as expected
})

tapetest('forEach', test => {
  const accumulator = []
  fi.range(10).forEach(x => accumulator.push(2 * x))
  test.deepEqual(accumulator, fi.range(10).map(x => 2 * x).toArray())
})

tapetest('reduce', test => {
  const result = fi.range(10).reduce((sum, x) => { sum += x; return sum }, 0)
  test.deepEqual(result, 45)
})

tapetest('toArray', test => {
  const array = fi.range(10).toArray()
  test.deepEqual(array, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
})

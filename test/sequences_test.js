import tape from 'tape'
import * as Sequences from '../src/sequences'

const makeTestRunner = (test) => (parameters) => {
  let [testName, inputIterable, expectedOutput] = parameters
  test.deepEqual(Array.from(inputIterable), expectedOutput, testName)
}

tape('concatentate', test => {
  [
    [
      'iterables concatenated in order',
      Sequences.concatenate([0, 1, 2, 3, 4], [5, 6, 7], [8, 9]),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    ],
    [
      'zero length input iterable supported',
      Sequences.concatenate([]),
      []
    ],
    [
      'undefined input iterable supported',
      Sequences.concatenate(),
      []
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('range', test => {
  [
    // [ partialTitle, inputArgs, equivalentInputArgs, expectedOutputAsArray]
    ['zero arguments', [], [0, 0, 1], []],
    ['one argument', [5], [0, 5, 1], [0, 1, 2, 3, 4]],
    ['two arguments', [2, 5], [2, 5, 1], [2, 3, 4, 5, 6]],
    ['three arguments', [2, 5, 3], [2, 5, 3], [2, 5, 8, 11, 14]],
    ['four arguments', [2, 5, 3, 6], [2, 5, 3], [2, 5, 8, 11, 14]]
  ].forEach(data => {
    // Transform initial test data into a form compatible with makeTestRunner
    const [testName, someParameters, allThreeParameters, expectedOutput] = data
    return [
      [`${testName}: ${someParameters}`, Sequences.range(...someParameters), expectedOutput],
      // Test with the three parameters that are equivalent to the test just above
      [`parameters equivalent to ${testName}: ${allThreeParameters}`, Sequences.range(...allThreeParameters), expectedOutput]
    ].forEach(makeTestRunner(test))
  })
  test.end()
})

tape('repeat', test => {
  [
    [
      'repeats a thing n times',
      Sequences.repeat(5, 'apple'),
      ['apple', 'apple', 'apple', 'apple', 'apple']
    ],
    [
      'repeats zero times',
      Sequences.repeat(0, 'alpha'),
      []
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

const iterableOne = ['able', 'better', 'chainable', 'dictionary', 'enhanced', 'cherry']
const iterableRef = [['able', 1], ['better', 2], ['chainable', 3], ['dictionary', 4], ['enhanced', 5]]

tape('zip', test => {
  [
    [
      'handles equal length iterables properly',
      Sequences.zip(iterableOne.slice(0, 5), Sequences.range(1, 5)),
      iterableRef
    ],
    [
      'zips until one of the iterables is exhausted',
      Sequences.zip(iterableOne, Sequences.range(1, 5)),
      iterableRef
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

tape('zipAll', test => {
  [
    [
      'handles equal length iterables properly',
      Sequences.zipAll(iterableOne.slice(0, 5), Sequences.range(1, 5)),
      iterableRef
    ],
    [
      'zips until all iterables are exhausted and missing values are undefined',
      Sequences.zipAll(iterableOne, Sequences.range(1, 5)),
      Array.from(Sequences.concatenate(iterableRef, [['cherry', undefined]]))
    ]
  ].forEach(makeTestRunner(test))
  test.end()
})

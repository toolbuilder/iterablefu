import { test as tape } from 'zora'
import * as generators from '../src/generators.js'

const makeTestRunner = (test) => (parameters) => {
  const { name, actual, expected } = parameters
  test.deepEqual(Array.from(actual), expected, name)
}

tape('concatentate', test => {
  [
    {
      name: 'iterables concatenated in order',
      actual: generators.concatenate([0, 1, 2, 3, 4], [5, 6, 7], [8, 9]),
      expected: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    {
      name: 'zero length input iterable supported',
      actual: generators.concatenate([]),
      expected: []
    },
    {
      name: 'undefined input iterable supported',
      actual: generators.concatenate(),
      expected: []
    },
    {
      name: 'empty iterables are supported at any point',
      actual: generators.concatenate([0, 1, 2], [], [3, 4]),
      expected: [0, 1, 2, 3, 4]
    }
  ].forEach(makeTestRunner(test))
})

const fromGenerator = function * () {
  for (let i = 0; i < 5; i++) {
    yield i
  }
}

tape('from', test => {
  [
    {
      name: 'creates a sequence from the provided generator',
      actual: generators.from(fromGenerator()),
      expected: [0, 1, 2, 3, 4]
    }
  ].forEach(makeTestRunner(test))
})

tape('range', test => {
  [
    // Generating tests from data:
    // shortArgList and fullArgList should produce equivalent output
    // [ partialName, shortArgList, fullArgList, expectedOutputAsArray]
    ['zero arguments', [], [0, 0, 1], []],
    ['one argument', [5], [0, 5, 1], [0, 1, 2, 3, 4]],
    ['two arguments', [2, 5], [2, 5, 1], [2, 3, 4, 5, 6]],
    ['three arguments', [2, 5, 3], [2, 5, 3], [2, 5, 8, 11, 14]],
    ['four arguments', [2, 5, 3, 6], [2, 5, 3], [2, 5, 8, 11, 14]]
  ].forEach(data => {
    // Transform initial test data into a form compatible with makeTestRunner
    const [partialName, shortArgList, fullArgList, expectedOutput] = data
    return [
      {
        name: `${partialName}: ${shortArgList}`,
        actual: generators.range(...shortArgList),
        expected: expectedOutput
      },
      // Test with the three parameters that are equivalent to the test just above
      {
        name: `parameters equivalent to ${partialName}: ${fullArgList}`,
        actual: generators.range(...fullArgList),
        expected: expectedOutput
      }
    ].forEach(makeTestRunner(test))
  })
})

tape('repeat', test => {
  [
    {
      name: 'repeats a thing n times',
      actual: generators.repeat(5, 'apple'),
      expected: ['apple', 'apple', 'apple', 'apple', 'apple']
    },
    {
      name: 'repeats zero times',
      actual: generators.repeat(0, 'alpha'),
      expected: []
    }
  ].forEach(makeTestRunner(test))
})

tape('repeatIterable', test => {
  [
    {
      name: 'repeats non-generator iterable n times',
      actual: generators.repeatIterable(3, [0, 1, 2]),
      expected: [0, 1, 2, 0, 1, 2, 0, 1, 2]
    },
    {
      name: 'repeats generator once... that is just how generators work',
      actual: generators.repeatIterable(3, generators.range(3)),
      expected: [0, 1, 2]
    }
  ].forEach(makeTestRunner(test))
})

// Some values for the zip tests
const iterableOne = ['able', 'better', 'chainable', 'dictionary', 'enhanced', 'cherry']
const iterableRef = [['able', 1], ['better', 2], ['chainable', 3], ['dictionary', 4], ['enhanced', 5]]

tape('zip', test => {
  [
    {
      name: 'handles equal length iterables properly',
      actual: generators.zip(iterableOne.slice(0, 5), generators.range(1, 5)),
      expected: iterableRef
    },
    {
      name: 'zips until one of the iterables is exhausted',
      actual: generators.zip(iterableOne, generators.range(1, 5)),
      expected: iterableRef
    }
  ].forEach(makeTestRunner(test))
})

tape('zipAll', test => {
  [
    {
      name: 'handles equal length iterables properly',
      actual: generators.zipAll(iterableOne.slice(0, 5), generators.range(1, 5)),
      expected: iterableRef
    },
    {
      name: 'zips until all iterables are exhausted and missing values are undefined',
      actual: generators.zipAll(iterableOne, generators.range(1, 5)),
      expected: Array.from(generators.concatenate(iterableRef, [['cherry', undefined]]))
    }
  ].forEach(makeTestRunner(test))
})

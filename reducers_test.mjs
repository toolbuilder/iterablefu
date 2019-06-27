import tape from 'tape'
import Reducers from './reducers'

const testSequence = () => Array.of(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)[Symbol.iterator]()

tape('forEach', test => {
  const accumulator = []
  Reducers.forEach(x => accumulator.push(2 * x), testSequence())
  test.deepEqual(accumulator, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18], 'calls function for each element')
  test.end()
})

tape('reduce', test => {
  const accumulator = Reducers.reduce((a, x) => { a.push(2 * x); return a }, [], testSequence())
  test.deepEqual(accumulator, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18], 'calls function for each element')
  test.end()
})

tape('toArray', test => {
  test.deepEqual(Reducers.toArray(testSequence()), Array.from(testSequence()), 'converts iterable values to array')
  test.end()
})

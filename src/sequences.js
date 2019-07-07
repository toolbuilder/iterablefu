export const concatenate = function * (...iterables) {
  for (let iterable of iterables) {
    yield * iterable
  }
}

/**
   * Creates a sequence of numbers similar to the Python range. See the example.
   *
   * @param  {...integer} args per the example
   * @returns {iterable} for the range
   * @example
   * // create a zero length range
   * range()
   * // [...range] is []
   *
   * // create a range of length 5
   * range(5)
   * // [...range(5)] equals [0, 1, 2, 3, 4]
   *
   * // create a range starting with 2, of length 5
   * range(2, 5)
   * // [...range(2, 5)] equals [2, 3, 4, 5, 6]
   *
   * // create a range starting with 2, of length 5, incrementing by 3
   * range(2, 5, 3)
   * // [...range(2, 5, 3)] equals [2, 5, 8, 11, 14]
   */
export const range = (...args) => {
  const ranger = function * (start, length, increment) {
    let value = start
    for (let i = 0; i < length; i++) {
      yield value
      value += increment
    }
  }
  switch (args.length) {
    case 0:
      return ranger(0, 0, 1)
    case 1:
      return ranger(0, args[0], 1)
    case 2:
      return ranger(args[0], args[1], 1)
    default:
      return ranger(...args)
  }
}

export const repeat = function * (n, thing) {
  for (let i = 0; i < n; i++) {
    yield thing
  }
}

export const zip = function * (...iterables) {
  const isDone = (nextResults) => nextResults.reduce((done, nextResult) => done || nextResult.done, false)
  let iterators = iterables.map(x => x[Symbol.iterator]())
  let nextResults = iterators.map(i => i.next())
  while (!isDone(nextResults)) {
    yield nextResults.map(result => result.value)
    nextResults = iterators.map(i => i.next())
  }
}

export const zipAll = function * (...iterables) {
  const isDone = (nextResults) => nextResults.reduce((done, nextResult) => done && nextResult.done, true)
  let iterators = iterables.map(x => x[Symbol.iterator]())
  let nextResults = iterators.map(i => i.next())
  while (!isDone(nextResults)) {
    yield nextResults.map(result => result.value)
    nextResults = iterators.map(i => i.next())
  }
}

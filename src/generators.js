/**
 * Concatenates a list of iterables into a single iterable.
 *
 * @param  {...Iterable} iterables to be concatenated
 * @returns {Generator} that provides the output of each iterable in turn
 * @example
 * const generator = concatenate([0, 1, 2], [3, 4])
 * console.log([...generator]) // prints [0, 1, 2, 3, 4]
 */
export const concatenate = function * (...iterables) {
  for (const iterable of iterables) {
    yield * iterable
  }
}

/**
 * Creates a sequence from the input sequence. This function exists solely
 * so that ChainableIterable has a static constructor method.
 *
 * @param {Iterable} inputIterable - the iterable
 * @returns {Generator} that represents the same iterable that was passed in
 * @example
 * const generatorFunction = function * (n) {
 *   for (let i = 0; i < n; i++) {
 *     yield i
 *   }
 * }
 * const generator = from(generatorFunction(3))
 * console.log([...generator]) // prints [0, 1, 2]
 */
export const from = function (iterable) {
  return iterable
}

/**
 * Creates a sequence of numbers similar to the Python range. See the example.
 *
 * @param  {...integer} args per the example
 * @returns {Generator} that represents the range
 * @example
 * console.log([...range()]) // prints []
 *
 * console.log([...range(5)]) // prints [0, 1, 2, 3, 4]
 *
 * console.log([...range(2, 5)]) // prints [2, 3, 4, 5, 6]
 *
 * console.log([...range(2, 5, 3)] // prints [2, 5, 8, 11, 14]
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

/**
 * Generates a sequence of things, n times
 *
 * @param {number} n - the number of times to repeat thing
 * @param {any} thing - the repeated thing
 * @returns {Generator} that will repeat thing, n times
 * @example
 * const generator = repeat(5, 'a')
 * console.log([...generator]) // prints ['a', 'a', 'a', 'a', 'a']
 */
export const repeat = function * (n, thing) {
  for (let i = 0; i < n; i++) {
    yield thing
  }
}

/**
 * Repeat an iterable n times.
 *
 * NOTE: Generator functions are designed to create one-time-use iterables, and will not work as expected
 * with repeatIterable. Once a generator completes, it won't restart, and therefore can't be repeated.
 *
 * Instead, use an iterable object where calling [Symbol.iterator] returns a new Generator object with
 * new state. See the examples below...
 *
 * @param {number} n - number of times to repeat iterable
 * @param {Iterable} repeatableIterable - the input iterable to repeat, see notes above and examples.
 * @returns {Generator} - that will repeat the input iterable n times
 * @example
 * // As noted above, use iterable objects, not generator functions with repeatIterable
 * const repeatable = (length) => {
 *   return {
 *     * [Symbol.iterator] () {
 *       for (let i = 0; i < length; i++) {
 *         yield i
 *       }
 *     }
 *   }
 * }
 * const a = repeatIterable(3, repeatable(3))
 * console.log([...a]) // prints [0, 1, 2, 0, 1, 2, 0, 1, 2] as expected
 *
  * // NOTE: This generator function will not work as expected with repeatIterable.
 * const oneTime = function * (length) {
 *   for (let i = 0; i < length; i++) {
 *     yield i
 *   }
 * }
 * const b = repeatIterable(3, oneTime(3))
 * console.log([...b]) // prints [0, 1, 2] OOPS!!!!
 */
export const repeatIterable = function * (n, repeatableIterable) {
  for (let i = 0; i < n; i++) {
    yield * repeatableIterable
  }
}

/**
 * Creates a sequence of arrays the same length as the *shortest* iterable provided. The first array contains the first
 * element from each of the iterables provided. The second array contains the second element from each of the
 * iterables provided, and so on.
 *
 * @param  {...Iterable} iterables the iterables to be zipped
 * @returns {Generator} for the zipped arrays
 * @example
 * const a = [0, 1, 2]
 * const b = ['a', 'b', 'c', 'd', 'e', 'f'] // note that this array is longer than a
 * const generator = zip(a, b)
 * console.log([...generator]) // prints [[0, 'a'], [1, 'b'], [2, 'c']]
 *
 */
export const zip = function * (...iterables) {
  const isDone = (nextResults) => nextResults.reduce((done, nextResult) => done || nextResult.done, false)
  const iterators = iterables.map(x => x[Symbol.iterator]())
  let nextResults = iterators.map(i => i.next())
  while (!isDone(nextResults)) {
    yield nextResults.map(result => result.value)
    nextResults = iterators.map(i => i.next())
  }
}

/**
 * Creates a sequence of arrays the same length as the *longest* iterable provided. The first array contains the first
 * element from each of the iterables provided. The second array contains the second element from each of the
 * iterables provided, and so on. Missing elements from the shorter iterables are set to undefined.
 *
 * @param  {...Iterable} iterables the iterables to be zipped
 * @returns {Generator} for the zipped arrays
 * @example
 * const a = [0, 1, 2]
 * const b = ['a', 'b', 'c', 'd'] // note that this array is longer than a
 * const generator = zipAll(a, b)
 * console.log([...generator]) // prints [[0, 'a'], [1, 'b'], [2, 'c'], [undefined, 'd']]
 *
 */
export const zipAll = function * (...iterables) {
  const isDone = (nextResults) => nextResults.reduce((done, nextResult) => done && nextResult.done, true)
  const iterators = iterables.map(x => x[Symbol.iterator]())
  let nextResults = iterators.map(i => i.next())
  while (!isDone(nextResults)) {
    yield nextResults.map(result => result.value)
    nextResults = iterators.map(i => i.next())
  }
}

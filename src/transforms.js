
import { zipAll } from './generators.js'

/**
 * Converts a sequence of Arrays to a sequence of Objects by assigning the property names
 * to each array element in turn. The input sequence doesn't have to provide arrays, it can
 * provide any sequence of iterable objects.
 *
 * If the arrays are too long, extra values are ignored.
 *
 * If the arrays are too short, the remaining properties are assigned undefined.
 *
 * @param {Iterable} propertyNames - a sequence of property names
 * @param {Iterable} iterable - a sequence of arrays (or any iterable objects)
 * @return {Generator} for the sequence of Objects
 * @example
 * const objects = arrayToObject(['a', 'b'], [[0, 1], [2, 3, 'a'], [4]])
 * // objects is [{'a': 0, 'b': 1 }, {'a': 2, 'b': 3 }, {'a': 4, 'b': undefined }]
 */
export const arrayToObject = function (propertyNames, iterable) {
  const fn = (iterableElement) => {
    const outputObject = {}
    const pairs = zipAll(propertyNames, iterableElement)
    for (const [propertyName, value] of pairs) {
      if (propertyName === undefined) continue
      outputObject[propertyName] = value
    }
    return outputObject
  }
  // implement arrayToObject in terms of map
  return map(fn, iterable)
}

/**
 * Chunk every n items into an array, and output that array in the output sequence.
 *
 * @param {number} n - the number of items to group into each array.
 * @param {Iterable} iterable - the sequence of items to group
 * @return {Generator} for the chunked sequence
 * @example
 * const a = chunk(2, [0, 1, 2, 3, 4, 5, 6])
 * console.log([...a]) // prints [[0, 1], [2, 3], [4, 5], [6]]
 */
export const chunk = function * (n, iterable) {
  let accumulator = []
  for (const item of iterable) {
    accumulator.push(item)
    if (accumulator.length === n) {
      yield accumulator
      accumulator = []
    }
  }
  if (accumulator.length > 0) {
    yield accumulator
  }
}

/**
 * Execute fn(previous, current) and yields the result for each pair.
 * Would be useful for calculating time differences between timestamps.
 *
 * @param {Function} fn - fn(previous, current), yielding return value
 * @param {Iterable} iterable - the input iterable
 * @returns {Generator} - if input has two or more items, output sequence
 * is one shorter than input sequence. Otherwise, no items are output.
 * @example
 * const a = diff((n, m) => m - n, [0, 1, 2, 3, 4])
 * console.log([...a]) // prints [1, 1, 1, 1]
 */
export const diff = function * (fn, iterable) {
  const iterator = iterable[Symbol.iterator]()
  let { value, done } = iterator.next()
  let previousValue = value
  ;({ value, done } = iterator.next())
  while (!done) {
    yield fn(previousValue, value)
    previousValue = value
    ;({ value, done } = iterator.next())
  }
}

/**
 * Keeps item from input sequence when fn(item) returns truthy. Remove items from input sequence when
 * fn(item) returns !truthy.
 *
 * @param {Function} fn - fn(item) returns truthy when item should be removed
 * @param {Iterable} iterable - the sequence to filter
 * @return {Generator} for the filtered sequence
 * @example
 * const isEvenNumber = x => x % 2 === 0
 * const a = filter(isEvenNumber, [0, 1, 2, 3, 4, 5, 6])
 * console.log([...a]) // prints even numbers [0, 2, 4, 6]
 */
export const filter = function * (fn, iterable) {
  for (const value of iterable) {
    if (fn(value) === true) {
      yield value
    }
  }
}

// These two functions are used by flatten and flattenRecursive.
// Generally accepted method of checking if something is a string.
const isString = (item) => typeof item === 'string' || item instanceof String
// Generally accepted method of checking if something supports the Iterable protocol
const isIterable = (item) => item && typeof item[Symbol.iterator] === 'function'

/**
 * Flattens a sequence of items one level deep. It does not flatten strings, even
 * though they are iterable.
 *
 * @param {Iterable} iterable - the iterable sequence to flatten
 * @returns {Generator} for the flattened sequence
 * @example
 * const a = flatten([[0, 1], [2, 3], [4, 5], [6]])
 * console.log([...a]) // prints [0, 1, 2, 3, 4, 5, 6]
 */
export const flatten = function * (iterable) {
  for (const value of iterable) {
    if (!isString(value) && isIterable(value)) {
      yield * value
    } else {
      yield value
    }
  }
}

/**
 * Flattens a sequence by recursively returning items from each iterable in the sequence.
 * Does not flatten strings even though they are iterable.
 *
 * @param {Iterable} iterable - the sequence to flatten
 * @returns {Generator} for the flattened sequence
 * @example
 * const input = [0, [1, 2, 3], [[4, 5], [[[6, 7]], [8, 9], 10]], 11, 12]
 * const a = flattenRecursive(input)
 * console.log([...a]) // prints [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
 */
export const flattenRecursive = function * (iterable) {
  for (const value of iterable) {
    if (!isString(value) && isIterable(value)) {
      yield * flattenRecursive(value)
    } else {
      yield value
    }
  }
}

/**
 * Generates a sequence of items by calling fn(item) for each item.
 *
 * @param {Function} fn - fn(item) returns the output item
 * @param {Iterable} iterable - the sequence to map
 * @returns {Generator} for the mapped sequence
 * @example
 * const a = map(x => 2 * x, [0, 1, 2, 3])
 * console.log([...a]) // prints [0, 2, 4, 6]
 */
export const map = function * (fn, iterable) {
  for (const value of iterable) {
    yield fn(value)
  }
}

/**
 * Map the input sequence to the output sequence with a generator that maps one iterator to another.
 *
 * This method exists solely so that ChainableIterable supports chaining for an arbitrary generator function.
 *
 * @param {Function} generatorFunction - a function that returns an iterable object, and takes an iterable as a parameter.
 * Typically, this will be a generator function.
 * @param {Iterable} iterable - the input sequence
 * @returns {Generator} for the mapped sequence
 * @example
 * const fn = function * (iterable) {
 *   for (let x of iterable) {
 *     yield x * x
 *   }
 * }
 * const a = mapWith(fn, [0, 1, 2, 3])
 * console.log([...a]) // prints [0, 1, 4, 9]
 */
export const mapWith = function (generatorFunction, iterable) {
  return generatorFunction(iterable)
}

/**
 * Given a sequence of Arrays, output the nth element of each array as a sequence.
 *
 * @param {number} index - the index of the Array to output
 * @param {Iterable} iterable - the iterable to process
 * @returns {Generator} for the nth elements
 * @example
 * const input = [[0, 1], [2, 3], [4, 5]]
 * const a = nth(1, input)
 * console.log([...a]) // prints [1, 3, 5]
 */
export const nth = (index, iterable) => {
  return map(x => (index < 0) ? x[x.length + index] : x[index], iterable)
}

/**
 * Given a sequence of Objects, output the specified property of each Object as a sequence.
 *
 * @param {string} propertyname - the property to extract from each Object
 * @param {Iterable} iterable - the input sequence of Objects
 * @returns {Generator} for the plucked items
 * @example
 * const input = [{'a': 1, 'b': 2}, {'a': 3, 'b': 4}, {'a': 5, 'b': 6}]
 * const a = pluck('a', input)
 * console.log([...a]) // prints [1, 3, 5]
 */
export const pluck = (propertyname, iterable) => {
  return map(x => x[propertyname], iterable)
}

/**
 * Reject items when fn(item) returns truthy.
 *
 * @param {Function} fn - fn(item) returns truthy when item should be removed from output sequence
 * @param {Iterable} iterable - input sequence
 * @returns {Generator} for the non-rejected items
 * @example
 * const isEvenNumber = x => x % 2 === 0
 * const a = reject(isEvenNumber, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
 * console.log([...a]) // prints [1, 3, 5, 7, 9]
 */
export const reject = (fn, iterable) => {
  return filter(x => fn(x) !== true, iterable)
}

/**
 * Create an output sequence that is the first n items of the input sequence.
 *
 * @param {number} n - the number of items to take
 * @param {Iterable} iterable - the input sequence to take items from
 * @returns {Generator} for the first n items
 * @example
 * const a = take(5, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
 * console.log([...a]) // prints [0, 1, 2, 3, 4]
 */
export const take = function * (n, iterable) {
  const iterator = iterable[Symbol.iterator]()
  let taken = 0
  let next
  while (taken < n) {
    next = iterator.next()
    taken += 1
    if (next.done === true) break
    yield next.value
  }
}

/**
 * Output items from the input iterable until fn(item) returns !truthy.
 *
 * @param {Function} fn - fn(item) returns truthy to put item in the output sequence
 * @param {Iterable} iterable - input sequence
 * @returns {Generator} for the selected items
 * @example
 * const a = takeWhile(x => x != 4, [0, 1, 2, 3, 4, 5, 6])
 * console.log([...a]) // prints [0, 1, 2, 3]
 */
export const takeWhile = function * (fn, iterable) {
  for (const item of iterable) {
    if (fn(item) !== true) break
    yield item
  }
}

/**
 * Pass the input sequence to the output sequence without change, but execute `fn(item)` for each
 * item in the sequence.
 *
 * @param {Function} fn - `fn(item)` is called for each item in the sequence
 * @param {Iterable} iterable - the input sequence
 * @returns {Generator} that is equivalent to the input iterable
 * @example
 * const a = tap(console.log, [1, 2, 3, 4, 5])
 * [...a] // prints [1, 2, 3, 4, 5]
 */
export const tap = (fn, iterable) => {
  return map(x => { fn(x); return x }, iterable)
}

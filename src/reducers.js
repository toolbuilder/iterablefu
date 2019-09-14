/**
 * Executes function fn(item, index) for each item in the iterable sequence provided.
 *
 * @param {Function} fn - a function(item, index), where item is the current item in the sequence, and index
 * is the index of the current item.
 * @param {Iterable} iterable - the sequence of items to call fn(item, index) with.
 * @returns {undefined}
 * @example
 * const fn = (item, index) => console.log(`item - ${item}, index - ${index}`)
 * forEach(fn, [1, 2, 3]) // prints the following...
 * // item - 1, index - 0
 * // item - 2, index - 1
 * // item - 3, index - 2
 */
export const forEach = (fn, iterable) => {
  let index = 0
  for (const item of iterable) {
    fn(item, index++)
  }
}

/**
 * The reduce() method executes a reducer function on each element of
 * the input iterable, resulting in a single output value.
 *
 * @param {Function} fn - fn(accumulator, item) that returns the new accumulator value
 * @param {any} accumulator - the initial accumulator value
 * @param {Iterable} iterable - the sequence to execute fn over.
 * @returns {any} - the final accumulator value
 * @example
 * const add = (a, b) => a + b
 * const sum = reduce(add, 0, [0, 1, 2, 3, 4]) // sum === 10
 */
export const reduce = (fn, accumulator, iterable) => {
  for (const item of iterable) {
    accumulator = fn(accumulator, item)
  }
  return accumulator
}

/**
 * Creates an  Array from the items in iterable.
 *
 * @param {Iterable} iterable - the iterable to create the array from
 * @returns {Array} - the array
 * @example
 * const a = toArray(range(5)) // a is [0, 1, 2, 3, 4]
 */
export const toArray = (iterable) => Array.from(iterable)

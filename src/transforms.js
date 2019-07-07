
import { zipAll } from './sequences'
const isString = (item) => typeof item === 'string' || item instanceof String
const isIterable = (item) => item && typeof item[Symbol.iterator] === 'function'

/**
 * The dependable object eliminates dependency surprises on downstream users.
 *
 * These are iterable factories that are used by other functions in the
 * default export object. Using 'this' in that object works perfectly fine,
 * but 'this' refers to the chainable iterable instance, not the export object.
 * Therefore, to use flatten in a custom chainable, flattenPerFunction also had
 * to be added. It's not obvious that's the case from a user perspective.
 * @private
 */

export const filter = function * (fn, iterable) {
  for (let value of iterable) {
    if (fn(value) === true) {
      yield value
    }
  }
}
export const flattenPerFunction = function * (fn, iterable) {
  for (let value of iterable) {
    const { iterate, itemToYield } = fn(value)
    if (iterate) {
      yield * itemToYield
    } else {
      yield itemToYield
    }
  }
}

export const map = function * (fn, iterable) {
  for (let value of iterable) {
    yield fn(value)
  }
}

export const arrayToObject = function (propertyNames, iterable) {
  let fn = (iterableElement) => {
    const outputObject = {}
    const pairs = zipAll(propertyNames, iterableElement)
    for (let [ propertyName, value ] of pairs) {
      if (propertyName === undefined) continue
      outputObject[propertyName] = value
    }
    return outputObject
  }
  // implement arrayToObject in terms of map
  return map(fn, iterable)
}
export const chunk = function * (n, iterable) {
  let accumulator = []
  for (let item of iterable) {
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
export const flatten = function (iterable) {
  const notStringsAndNotRecursive = (item) => {
    if (!isString(item) && isIterable(item)) {
      return { iterate: true, itemToYield: item }
    }
    return { iterate: false, itemToYield: item }
  }
  return flattenPerFunction(notStringsAndNotRecursive, iterable)
}
export const flattenRecursive = function (iterable) {
  const notStringsAndRecursive = (item) => {
    if (!isString(item) && isIterable(item)) {
      return { iterate: true, itemToYield: this.flattenPerFunction(notStringsAndRecursive, item) }
    }
    return { iterate: false, itemToYield: item }
  }
  return flattenPerFunction(notStringsAndRecursive, iterable)
}
export const pluck = (propertyname, iterable) => {
  return map(x => x[propertyname], iterable)
}
export const nth = (index, iterable) => {
  return map(x => (index < 0) ? x[x.length + index] : x[index], iterable)
}
export const reject = (fn, iterable) => {
  return filter(x => fn(x) !== true, iterable)
}
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
export const takeWhile = function * (fn, iterable) {
  for (let item of iterable) {
    if (fn(item) !== true) break
    yield item
  }
}
export const tap = (fn, iterable) => {
  return map(x => { fn(x); return x }, iterable)
}

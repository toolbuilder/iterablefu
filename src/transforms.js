
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
 */
const dependable = {
  filter: (fn, iterable) => {
    return {
      * [Symbol.iterator] () {
        for (let value of iterable) {
          if (fn(value) === true) {
            yield value
          }
        }
      }
    }
  },
  flattenPerFunction: (fn, iterable) => {
    return {
      * [Symbol.iterator] () {
        for (let value of iterable) {
          const { iterate, itemToYield } = fn(value)
          if (iterate) {
            yield * itemToYield
          } else {
            yield itemToYield
          }
        }
      }
    }
  },
  map: (fn, iterable) => {
    return {
      * [Symbol.iterator] () {
        for (let value of iterable) {
          yield fn(value)
        }
      }
    }
  }
}

export default {
  arrayToObject: function (propertyNamesInArrayOrder, iterable) {
    let fn = (array) => {
      const outputObject = {}
      const length = array === undefined ? 0 : array.length
      for (let i = 0; i < propertyNamesInArrayOrder.length; i++) {
        outputObject[propertyNamesInArrayOrder[i]] = (i < length) ? array[i] : undefined
      }
      return outputObject
    }
    return dependable.map(fn, iterable)
  },
  chunk: (n, iterable) => {
    return {
      * [Symbol.iterator] () {
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
    }
  },
  filter: (fn, iterable) => {
    return dependable.filter(fn, iterable)
  },
  flatten: function (iterable) {
    const notStringsAndNotRecursive = (item) => {
      if (!isString(item) && isIterable(item)) {
        return { iterate: true, itemToYield: item }
      }
      return { iterate: false, itemToYield: item }
    }
    return dependable.flattenPerFunction(notStringsAndNotRecursive, iterable)
  },
  flattenRecursive: function (iterable) {
    const notStringsAndRecursive = (item) => {
      if (!isString(item) && isIterable(item)) {
        return { iterate: true, itemToYield: this.flattenPerFunction(notStringsAndRecursive, item) }
      }
      return { iterate: false, itemToYield: item }
    }
    return dependable.flattenPerFunction(notStringsAndRecursive, iterable)
  },
  flattenPerFunction: (fn, iterable) => {
    return dependable.flattenPerFunction(fn, iterable)
  },
  map: (fn, iterable) => {
    return dependable.map(fn, iterable)
  },
  pluck (propertyname, iterable) {
    return dependable.map(x => x[propertyname], iterable)
  },
  nth (index, iterable) {
    return dependable.map(x => (index < 0) ? x[x.length + index] : x[index], iterable)
  },
  reject (fn, iterable) {
    return dependable.filter(x => fn(x) !== true, iterable)
  },
  take: (n, iterable) => {
    return {
      * [Symbol.iterator] () {
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
    }
  },
  takeWhile: (fn, iterable) => {
    return {
      * [Symbol.iterator] () {
        for (let item of iterable) {
          if (fn(item) !== true) break
          yield item
        }
      }
    }
  },
  tap (fn, iterable) {
    return dependable.map(x => { fn(x); return x }, iterable)
  }
}

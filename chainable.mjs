
// From somewhere...
// Transducers are composable and efficient data transformation functions that don’t create intermediate collections.
// Some languages call them loop fusion or stream fusion

const SequenceGenerators = {
  concatenate: (...iterables) => {
    return {
      * [Symbol.iterator] () {
        for (let iterable of iterables) {
          yield * iterable
        }
      }
    }
  },
  // zero arguments: start = 0, length = 0, increment = 1
  // one arguments: start = 0, length = args[0], increment = 1
  // two arguments: start = args[0], length = args[1], increment = 1
  // three arguments: start = args[0], length = args[1], increment = args[2]
  // start is the first value of the range
  // length is the number of elements in the range
  // increment is the difference between two adjacent elements
  // in other words the value of each element is:
  //   start + (increment * index) where start <= index && index < length
  range: (...args) => {
    const ranger = (start, length, increment) => {
      return {
        * [Symbol.iterator] () {
          let value = start
          for (let i = 0; i < length; i++) {
            yield value
            value += increment
          }
        }
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
  },
  repeat: (n, thing) => {
    return {
      * [Symbol.iterator] () {
        for (let i = 0; i < n; i++) {
          yield thing
        }
      }
    }
  },
  zip: (...iterables) => {
    return {
      isDone: (nextResults) => nextResults.reduce((done, nextResult) => done || nextResult.done, false),
      iterators: iterables.map(x => x[Symbol.iterator]()),
      * [Symbol.iterator] () {
        let nextResults = this.iterators.map(i => i.next())
        while (!this.isDone(nextResults)) {
          yield nextResults.map(result => result.value)
          nextResults = this.iterators.map(i => i.next())
        }
      }
    }
  },
  zipAll: (...iterables) => {
    return {
      isDone: (nextResults) => nextResults.reduce((done, nextResult) => done && nextResult.done, true),
      iterators: iterables.map(x => x[Symbol.iterator]()),
      * [Symbol.iterator] () {
        let nextResults = this.iterators.map(i => i.next())
        while (!this.isDone(nextResults)) {
          yield nextResults.map(result => result.value)
          nextResults = this.iterators.map(i => i.next())
        }
      }
    }
  }
}

const Reducers = {
  forEach: (fn, iterable) => {
    for (let item of iterable) {
      fn(item)
    }
  },
  // fn(accumulator, item), returns accumulator
  reduce: (fn, accumulator, iterable) => {
    for (let value of iterable) {
      accumulator = fn(accumulator, value)
    }
    return accumulator
  },
  toArray: (iterable) => {
    return Array.from(iterable)
  }
}

// Call each function in fns. Pass the return value of one function to the next one called.
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x)
const isString = (item) => typeof item === 'string' || item instanceof String
const isIterable = (item) => item && typeof item[Symbol.iterator] === 'function'

const Transforms = {
  arrayToObject: function (propertyNamesInArrayOrder, iterable) {
    let fn = pipe(
      // want all properties to be in returned object even if there aren't enough values, so zipAll
      (iterable) => SequenceGenerators.zipAll(propertyNamesInArrayOrder, iterable),
      // if there are too many value, remove the ones not associated with a property
      (iterable) => this.take(propertyNamesInArrayOrder.length, iterable),
      // add each property with associated value to returned object o
      (iterable) => Reducers.reduce((o, nv) => { o[nv[0]] = nv[1]; return o }, {}, iterable)
    )
    return this.map(fn, iterable)
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
  flatten: function (iterable) {
    const notStringsAndNotRecursive = (item) => {
      if (!isString(item) && isIterable(item)) {
        return { iterate: true, itemToYield: item }
      }
      return { iterate: false, itemToYield: item }
    }
    return this.flattenPerFunction(notStringsAndNotRecursive, iterable)
  },
  flattenRecursive: function (iterable) {
    const notStringsAndRecursive = (item) => {
      if (!isString(item) && isIterable(item)) {
        return { iterate: true, itemToYield: this.flattenPerFunction(notStringsAndRecursive, item) }
      }
      return { iterate: false, itemToYield: item }
    }
    return this.flattenPerFunction(notStringsAndRecursive, iterable)
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
  },
  pluck (propertyname, iterable) {
    return this.map(x => x[propertyname], iterable)
  },
  nth (index, iterable) {
    return this.map(x => (index < 0) ? x[x.length + index] : x[index], iterable)
  },
  reject (fn, iterable) {
    return this.filter(x => fn(x) !== true, iterable)
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
    return this.map(x => { fn(x); return x }, iterable)
  }
}

// TODO: make a fi factory, use it to create initial fi as well as extensions
// TODO: support extensions by creating anonymous class that extends ChainableIterable
const makeChainableIterable = function (reducers, transforms) {
  // construct chainable iterable class using both class semantics
  // then adding methods using the classic prototype assignment technique
  const Chainable = class {
    constructor (iterable) {
      this.chainedIterable = iterable
    }
    [Symbol.iterator] () {
      return this.chainedIterable[Symbol.iterator]()
    }
  }

  // Dynamically add Transform methods to class
  for (let methodName in transforms) {
    Chainable.prototype[methodName] = function (...args) {
      this.chainedIterable = transforms[methodName](...args, this.chainedIterable)
      return this
    }
  }

  // Dynamically add Reducer methods to class
  for (let methodName in reducers) {
    Chainable.prototype[methodName] = function (...args) {
      return reducers[methodName](...args, this.chainedIterable)
    }
  }
  return Chainable
}

const makeChainableIterableBuilder = function (sequenceGenerators, reducers, transforms) {
  const ChainableIterator = makeChainableIterable(reducers, transforms)

  const builder = function (iterable) {
    return new ChainableIterator(iterable)
  }

  // Dynamically add sequenceGenerators to factory function
  for (let methodName in sequenceGenerators) {
    builder[methodName] = function (...args) {
      return new ChainableIterator(sequenceGenerators[methodName](...args))
    }
  }

  return builder
}

class FunctionalIterables {
  constructor (sequenceGenerators, transforms, reducers) {
    this.sequenceGenerators = sequenceGenerators
    this.transforms = transforms
    this.reducers = reducers
    this.defaultBuilder = this.customBuilder(sequenceGenerators, transforms, reducers)
  }

  builder () {
    return this.defaultBuilder
  }

  customBuilder (sequenceGenerators, transforms, reducers) {
    const Chainable = this.chainableIteratorFactory(transforms, reducers)

    const builder = function (iterable) {
      return new Chainable(iterable)
    }

    // Dynamically add sequenceGenerators to factory function
    for (let methodName in sequenceGenerators) {
      builder[methodName] = function (...args) {
        return new Chainable(sequenceGenerators[methodName](...args))
      }
    }

    return builder
  }

  chainableIteratorFactory (transforms, reducers) {
  // construct chainable iterable class using both class semantics
  // then adding methods using the classic prototype assignment technique
    const Chainable = class {
      constructor (iterable) {
        this.chainedIterable = iterable
      }
      [Symbol.iterator] () {
        return this.chainedIterable[Symbol.iterator]()
      }
    }

    // Dynamically add Transform methods to class
    for (let methodName in transforms) {
      Chainable.prototype[methodName] = function (...args) {
        this.chainedIterable = transforms[methodName](...args, this.chainedIterable)
        return this
      }
    }

    // Dynamically add Reducer methods to class
    for (let methodName in reducers) {
      Chainable.prototype[methodName] = function (...args) {
        return reducers[methodName](...args, this.chainedIterable)
      }
    }
    return Chainable
  }
}

export default new FunctionalIterables(SequenceGenerators, Transforms, Reducers)
// export default makeChainableIterableBuilder(SequenceGenerators, Reducers, Transforms)

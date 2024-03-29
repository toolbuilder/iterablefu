import { makeFactory } from '@toolbuilder/make-factory'
/**
 * Dynamically create a ChainableClass. This differs from makeChainableIterator only in that the class can't be
 * called as a function.
 *
 * @param {Object} generators - Each key is the name of a generator, the value is a generator function.
 * @param {Object} transforms - Each key is the name of a transform, the value is a generator function that takes
 * an iterable as the last argument.
 * @param {Object} reducers - Each key is the name of a reducer, the value is a function that takes the iterable
 * to reduce as the last argument.
 */
export const makeChainableClass = (generators, transforms, reducers) => {
  // construct chainable iterable class using both class semantics
  // then add methods using the classic prototype assignment technique
  const Chainable = class {
    constructor (iterable) {
      this.chainedIterable = iterable
    }

    * [Symbol.iterator] () {
      yield * this.chainedIterable
    }
  }

  // Dynamically add static Sequence methods to class
  for (const methodName in generators) {
    Chainable[methodName] = function (...args) {
      return new Chainable(generators[methodName](...args))
    }
  }

  // Dynamically add Transform methods to class
  for (const methodName in transforms) {
    Chainable.prototype[methodName] = function (...args) {
      this.chainedIterable = transforms[methodName](...args, this.chainedIterable)
      return this
    }
  }

  // Dynamically add Reducer methods to class
  for (const methodName in reducers) {
    Chainable.prototype[methodName] = function (...args) {
      return reducers[methodName](...args, this.chainedIterable)
    }
  }
  return Chainable
}

/**
 * Dynamically create a ChainableIterable class/function.
 *
 * @param {Object} generators - Each key is the name of a generator, the value is a generator function.
 * @param {Object} transforms - Each key is the name of a transform, the value is a generator function that takes
 * the iterable to transform as the last argument.
 * @param {Object} reducers - Each key is the name of a reducer, the value is a function that takes the iterable to
 * reduce as the last argument.
 */
export const makeChainableIterable = (generators, transforms, reducers) => {
  const ChainableClass = makeChainableClass(generators, transforms, reducers)

  return makeFactory(ChainableClass)
}

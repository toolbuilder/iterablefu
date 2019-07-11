/**
 * Dynamically create a ChainableClass. This differs from makeChainableIterator only in that the class can't be
 * called as a function. See customization tutorial for more information.
 *
 * @param {Object} sequences - Each key is the name of a sequence generator, the value is a generator function.
 * @param {Object} transforms - Each key is the name of a transform, the value is a generator function that takes
 * a Generator as the last argument.
 * @param {Object} reducers - Each key is the name of a reducer, the value is a generator function that takes a
 * Generator as the last argument.
 */
export const makeChainableClass = (sequences, transforms, reducers) => {
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
  for (let methodName in sequences) {
    Chainable[methodName] = function (...args) {
      return new Chainable(sequences[methodName](...args))
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

/**
 * Dynamically create a ChainableIterable class/function. See customization tutorial for more information.
 *
 * @param {Object} sequences - Each key is the name of a sequence generator, the value is a generator function.
 * @param {Object} transforms - Each key is the name of a transform, the value is a generator function that takes
 * a Generator as the last argument.
 * @param {Object} reducers - Each key is the name of a reducer, the value is a generator function that takes a
 * Generator as the last argument.
 */
export const makeChainableIterable = (sequences, transforms, reducers) => {
  const ChainableClass = makeChainableClass(sequences, transforms, reducers)

  const ChainableIterable = function (iterable) {
    return new ChainableClass(iterable)
  }

  ChainableIterable.ChainableIterable = ChainableClass // provided to support testing

  // Dynamically add static sequence generator methods to class
  for (let methodName in sequences) {
    ChainableIterable[methodName] = function (...args) {
      return ChainableClass[methodName](...args)
    }
  }

  return ChainableIterable
}

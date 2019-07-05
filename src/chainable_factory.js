/**
 * Creates an anonymous class that is iterable, and has chainable methods to create
 * transformations on the iterable provided to the constructor.
 *
 * The chainable methods are dynamically generated for each iterable factory function
 * in transforms and reducers. The methods generated from the reducers are not chainable.
 *
 * @function createChainableIterable
 * @param  {Object} transforms an Object where each key is an iterable object factory, where the
 * last parameter is another iterable.
 * @param  {Object} reducers   an Object where each key is a function where the last parameter is an iterable.
 * @return {Class} TODO
 * @example
 * const transforms = {
 *   // any number of parameters are allowed, but the last must be an iterable
 *   map: (fn, iterable) => {
 *     return {
 *       * [Symbol.iterator] () {
 *         for (let value of iterable) {
 *            yield fn(value)
 *         }
 *       }
 *     }
 *   }
 * }
 *
 * const reducers = {
 *   // any number of parameters are allowed, but the last must be an iterator
 *   'toArray': (iterable) => Array.from(iterable)
 * }
 * const ChainableIterable = createChainableIterable(transforms, reducers)
 * const array = new ChainableIterable([1, 2]).map(x => 2 * x).toArray()
 * // array has the value [2, 4]
 *
 */
const createChainableIterable = (transforms, reducers) => {
  // construct chainable iterable class using both class semantics
  // then add methods using the classic prototype assignment technique
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

export default (sequences, transforms, reducers) => {
  const Chainable = createChainableIterable(transforms, reducers)

  const builder = function (iterable) {
    return new Chainable(iterable)
  }

  builder.Chainable = Chainable // provided to support testing and customization

  // Dynamically add sequenceGenerators to factory function instance
  for (let methodName in sequences) {
    builder[methodName] = function (...args) {
      return new Chainable(sequences[methodName](...args))
    }
  }

  return builder
}

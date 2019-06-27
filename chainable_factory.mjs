export default class ChainableFactory {
  createBuilder (sequenceGenerators, transforms, reducers) {
    const Chainable = this.createChainableIterator(transforms, reducers)

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

  createChainableIterator (transforms, reducers) {
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

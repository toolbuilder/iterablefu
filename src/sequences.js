export default {
  /**
   * Creates an iterable that iterates over each provided iterable in the order provided.
   *
   * @param {iterables} one or more iterables
   * @returns iterable
   */
  concatenate: (...iterables) => {
    return {
      * [Symbol.iterator] () {
        for (let iterable of iterables) {
          yield * iterable
        }
      }
    }
  },
  /**
   * Creates an iterable that generates a sequence of numbers
   *
   * @param args The range function works like Python ranges, 
   * and can be called with up to 3 paramters:
   *
   * zero arguments: start = 0, length = 0, increment = 1
   * one arguments: start = 0, length = args[0], increment = 1
   * two arguments: start = args[0], length = args[1], increment = 1
   * three arguments: start = args[0], length = args[1], increment = args[2]
   *
   * start is the first value of the range
   * length is the number of elements in the range
   * increment is the difference between two adjacent elements
   *
   * In other words the nth value generates is:
   *   start + (increment * n) where start <= n && n < length
   */
  range (...args) {
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

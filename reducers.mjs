export default {
  forEach: (fn, iterable) => {
    for (let item of iterable) {
      fn(item)
    }
  },
  // fn(accumulator, item), returns accumulator
  reduce: (fn, accumulator, iterable) => {
    for (let item of iterable) {
      accumulator = fn(accumulator, item)
    }
    return accumulator
  },
  toArray: (iterable) => {
    return Array.from(iterable)
  }
}

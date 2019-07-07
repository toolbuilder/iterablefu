export const forEach = (fn, iterable) => {
  for (let item of iterable) {
    fn(item)
  }
}

export const reduce = (fn, accumulator, iterable) => {
  for (let item of iterable) {
    accumulator = fn(accumulator, item)
  }
  return accumulator
}

export const toArray = (iterable) => Array.from(iterable)

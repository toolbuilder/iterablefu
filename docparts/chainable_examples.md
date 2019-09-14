# Examples

## Sequences

### concatenate

```javascript
const a = <%= static %>.concatenate([0, 1, 2], [3, 4]).toArray()
console.log(a) // prints [0, 1, 2, 3, 4]
```

### from

```javascript
const fn = function * (n) {
  for (i = 0; i < n; i++) {
    yield i
  }
}
const a = <%= static %>.from(fn(5)).toArray()
console.log(a) // prints [0, 1, 2, 3, 4]
```

### range

```javascript
console.log([...<%= static %>.range()]) // prints []
console.log([...<%= static %>.range(5)]) // prints [0, 1, 2, 3, 4]
console.log([...<%= static %>.range(2, 5)]) // prints [2, 3, 4, 5, 6]
console.log([...<%= static %>.range(2, 5, 3)] // prints [2, 5, 8, 11, 14]
```

### repeat

```javascript
const generator = <%= static %>.repeat(5, 'a')
console.log([...generator]) // prints ['a', 'a', 'a', 'a', 'a']
```

### repeatIterable

```javascript
// As noted above, use functions that create iterable objects,
// not generator functions, with repeatIterable.
const repeatable = (length) => {
  return {
    * [Symbol.iterator] () {
      for (let i = 0; i < length; i++) {
        yield i
      }
    }
  }
}
const a = <%= static %>.repeatIterable(3, repeatable(3))
console.log([...a]) // prints [0, 1, 2, 0, 1, 2, 0, 1, 2] as expected

// NOTE: This generator function will not work as expected with repeatIterable.
const oneTime = function * (length) {
  for (let i = 0; i < length; i++) {
    yield i
  }
}
const b = <%= static %>.repeatIterable(3, oneTime(3))
console.log([...b]) // prints [0, 1, 2] OOPS!!!!
```

### zip

```javascript
const a = [0, 1, 2]
const b = ['a', 'b', 'c', 'd', 'e', 'f'] // note that this array is longer than a
const generator = <%= static %>.zip(a, b)
console.log([...generator]) // prints [[0, 'a'], [1, 'b'], [2, 'c']]
```

### zipAll

```javascript
const a = [0, 1, 2]
const b = ['a', 'b', 'c', 'd'] // note that this array is longer than a
const generator = <%= static %>.zipAll(a, b)
console.log([...generator]) // prints [[0, 'a'], [1, 'b'], [2, 'c'], [undefined, 'd']]
```

## Transforms

### arrayToObject

```javascript
const input = [[0, 1], [2, 3, 'a'], [4]]
const a = <%= ctor %>(input).arrayToObject(['a', 'b']).toArray()
console.log(a) // prints [{'a': 0, 'b': 1 }, {'a': 2, 'b': 3 }, {'a': 4, 'b': undefined }]
```

### chunk

```javascript
const input = [0, 1, 2, 3, 4, 5, 6]
const a = <%= ctor %>(input).chunk(2).toArray()
console.log(a) // prints [[0, 1], [2, 3], [4, 5], [6]]
```

### diff

```javascript
const input = [0, 1, 2, 3, 4]
const a = <%= ctor %>(input).diff((n, m) => m - n).toArray()
console.log(a)  // prints [1, 1, 1, 1]
```

### filter

```javascript
const isEvenNumber = x => x % 2 === 0
const input = [0, 1, 2, 3, 4, 5, 6]
const a = <%= ctor %>(input).filter(isEvenNumber).toArray()
console.log(a) // prints even numbers [0, 2, 4, 6]
```

### flatten

```javascript
const input = [[0, 1], [2, 3], [4, 5], [6]]
const a = <%= ctor %>(input).flatten().toArray()
console.log(a) // prints [0, 1, 2, 3, 4, 5, 6]
```

### flattenRecursive

```javascript
const input = [0, [1, 2, 3], [[4, 5], [[[6, 7]], [8, 9], 10]], 11, 12]
const a = <%= ctor %>(input).flattenRecursive().toArray()
console.log(a) // prints [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
```

### map

```javascript
const input = [0, 1, 2, 3]
const a = <%= ctor %>(input).map(x => 2 * x).toArray()
console.log(a) // prints [0, 2, 4, 6]
```

### mapWith

```javascript
const fn = function * (n, iterable) {
  for (let x of iterable) {
    yield n * x
  }
}
const input = [0, 1, 2, 3, 4]
// If your generator takes additional parameters beyond iterable, you'll need
// to wrap it with another function as shown
const wrapper = (iterable) => fn(3, iterable)
const a = <%= ctor %>(input).mapWith(wrapper).toArray()
console.log(a) // prints [0, 3, 6, 9, 12]
```

### nth

```javascript
const input = [[0, 1], [2, 3], [4, 5]]
const a = <%= ctor %>(input).nth(1).toArray()
console.log(a) // prints [1, 3, 5]
```

### pluck

```javascript
const input = [{'a': 1, 'b': 2}, {'a': 3, 'b': 4}, {'a': 5, 'b': 6}]
const a = <%= ctor %>(input).pluck('a').toArray()
console.log(a) // prints [1, 3, 5]
```

### reject

```javascript
const isEvenNumber = x => x % 2 === 0
const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const a = <%= ctor %>(input).reject(isEvenNumber).toArray()
console.log(a) // prints [1, 3, 5, 7, 9]
```

### take

```javascript
const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const a = <%= ctor %>(input).take(5).toArray()
console.log(a) // prints [0, 1, 2, 3, 4]
```

### takeWhile

```javascript
const input = [0, 1, 2, 3, 4, 5, 6]
const a = <%= ctor %>(input).takeWhile(x => x != 4).toArray()
console.log(a) // prints [0, 1, 2, 3]
```

### tap

```javascript
const input = [1, 2, 3, 4, 5]
const a = <%= ctor %>(input).tap(console.log).toArray()
// prints [1, 2, 3, 4, 5]
```

## Reducers

### forEach

```javascript
const fn = (item, index) => console.log(`item - ${item}, index - ${index}`)
<%= ctor %>([1, 2, 3]).forEach(fn) // prints the following...
// item - 1, index - 0
// item - 2, index - 1
// item - 3, index - 2
```

### reduce

```javascript
const add = (a, b) => a + b
const sum = <%= ctor %>([0, 1, 2, 3, 4]).reduce(add, 0) // sum === 10
```

### toArray

```javascript
const a = <%= static %>.range(5).toArray() // a is [0, 1, 2, 3, 4]
```

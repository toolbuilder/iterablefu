# IterableFu

`IterableFu` is a small library that provides functions like range, map, reduce, filter, zip, for iterable objects.
It also provides a chainable iterable, which can be customized to reduce bundle size, or extended.

## Features

* Chainable transform builder `chainable.range(2, 5).map(x => 2*x).toArray()` **link to examples**
* Easy to use with your iterables and generators `chainable.from(yourGenerator).mapWith(yourTransform)`
* Factory for creating your own chainable builder `makeChainableIterable(sequences, transforms, reducers)`
* Functional API takes data last, so you can curry, pipe and compose with your functional library
* Easily support tree-shaking **link**
* Runs in Node and browsers
* Written using ES modules
* Browser version has zero dependencies. Node uses esm for the CommonJS interface.

## Table of Contents

!toc (minlevel=2 omit="Features;Table of Contents")

## Installation

```bash
npm install --save iterablefu
```

## Getting Started

If you want the chainable API, use this import.

```javascript
import { chainable } from 'iterablefu'
```

If you want the functional API, use this import.

```javascript
import { sequences, transforms, reducers } from 'iterablefu'
```

## API

TODO: put API links here

## Examples

### Basics

IterableFu provides three basic categories of functions:

* **Sequences** - convert something into an iterable sequence
* **Transforms** - convert one iterable sequence into another
* **Reducers** - convert an iterable sequence into a value

Here's a quick example showing `range` (a sequence), `map` (a transform), and `reduce` (a reducer).

```javascript
import { chainable } from 'iterablefu'
const answer = chainable.range(5).map(x => 2 * x).reduce((a, x) => a + x, 0) // 0 + 2 + 4 + 6 + 8 = 20
console.log(answer) // prints 20
```

Here are some common methods to convert from iterables such as Arrays into chainable iterables.

```javascript
const d = chainable.from([1, 2, 3]) // makes a chainable version of [1, 2, 3]
const e = chainable.concatenate([0, 1, 2], [3, 4]) // becomes [0, 1, 2, 3, 4]
const f = chainable.zip([1, 2, 3], ['a', 'b', 'c']) // becomes [[1, 'a'], [2, 'b'], [3, 'c']]
```

There are several ways to convert back to Arrays.

```javascript
const a = Array.from(chainable.range(5)) // a has the value [0, 1, 2, 3, 4, 5]
const b = [...chainable.range(3)] // b has the value [0, 1, 2]
const c = chainable.range(2, 5).toArray() // c has the value [2, 3, 4, 5, 6]
```

### One Time Use

Except for one method, `repeatIterable` **link API**, `IterableFu` only supports one-time use. This matches the
intended use of the library, but also reflects what happens when you use generator functions with the library.

Generator functions create Generator objects which are both *iterable* (have `[Symbol.iterator]`) and *iterators* (have `next()`).
Iterators can only be used once. So when you call a generator function to provide an iterable to `IterableFu`, you are
passing a Generator object that can only be iterated once. **MDN link here**

Compare this to Array. When you call `Array[Symbol.iterator]()` you get a one-time use Generator. But when you call
`Array[Symbol.iterator]()` again, you get a different one-time use Generator object.


```javascript
// IterableFu produces one-time use sequences
const a = chainable.range(5)
console.log([...a]) // print [0, 1, 2, 3, 4]
console.log([...a]) // prints [] because the first log statement used the iterable
// This is not a bug, chainable works exactly like generator functions because it uses them internally
```

To reuse an `IterableFu` transformation, wrap it in a function so that a new Generator object is returned each time it is called.

```javascript
const fn = () => chainable.range(5)
// Note the function calls below...
console.log([...fn()]) // prints [0, 1, 2, 3, 4]
console.log([...fn()]) // prints [0, 1, 2, 3, 4]
```

### Generators

To use a generator function that creates a sequence, use chainable as a function or `concatenate`.

```javascript
// A simple generator function as an example
const fn = function * (length) {
  for (let i = 0; i < length; i++) {
    yield i
  }
}
// be sure to call the generator, don't just pass the function
const a = chainable(fn(3))
console.log([...a]) // prints [0, 1, 2]
```

To use a generator that transforms a sequence, use `mapWith`.

```javascript
// An example generator that transforms another sequence.
const fn = function * (n, iterable) {
  for (let x of iterable) {
    yield n * x
  }
}
const input = [0, 1, 2, 3, 4]
// If your generator takes additional parameters beyond iterable, you'll need
// to wrap it with another function as shown so that the resulting function
// takes only the iterable to be transformed.
const wrapper = (iterable) => fn(3, iterable)
const a = chainable(input).mapWith(wrapper).toArray()
console.log(a) // prints [0, 3, 6, 9, 12]
```

### Extending

The simplest way to extend `IterableFu` is to use the `makeChainableIterable` method. You'll need
sequences, transforms, and reducers as described in the **Basics** section.

Your sequence and transform methods can either return iterable objects, or be generator functions. The
sequence methods become static methods, and can have any parameters you wish. The transform methods can
have any parameters, but the last one must be for the iterable to be transformed.

```javascript
import { makeChainableIterable, sequences, transforms, reducers } from 'iterablefu'

// Your new sequence generator becomes a static method on the class
const simpleRange = function * (length) {
  for (let i = 0; i < length; i++) {
    yield i
  }
}

// Your new transform generator, the iterable to transform must always be the last parameter.
// As an example, we use a function that returns an iterable object instead of using a 
// generator function here. You can return anything that supports the iterable protocol.
const multiply = function (n, iterable) {
  return {
    * [Symbol.iterator] () {
      for (let x of iterable) {
        yield n * x
      }
    }
  }
}

// You can implement your method using the functional API methods. Don't use 'this', because
// the chainable class methods do not accept the iterable parameter. Because anotherMultiply
// returns a generator, it shouldn't be a generator function itself (no asterisk).
const anotherMultiply = function (iterable) {
  return transforms.map(x = 2 * x, iterable)
}

// add your methods to the existing ones
const mySequences = { ...sequences, simpleRange }
const myTransforms = { ...transforms, multiply, anotherMultiply }

const customChainable = makeChainableIterable(mySequences, myTransforms, reducers)

// Use your new class
const a = customChainable.simpleRange(3).multiply(2).toArray()
```

If you don't like `makeChainableIterable` or `makeChainableClass`, then you can extend `ChainableIterable`.

```javascript
import { ChainableIterable } from 'iterablefu'

// extend ChainableIterable here...
```

### Reducing bundle size

The import `'./src/chainable.js'` pulls in everything from the IterableFu package. However, a reduced
dependency version of chainable is easy to create. Instead of importing `'./src/chainable.js'`,
just import what you need and call `makeChainableIterable` to create your chainable class. Here's
an example using the stock functions from this package. The **Extending** section shows how to extend your
customChainable with new functionality.

```javascript
import { zip, range } from './src/sequences.js'
import { map, filter, mapWith } from './src/transforms.js'
import { reduce, toArray } from './src/reducers.js'

const customChainable = makeChainableIterable(
  { zip, range }, // supply the sequence generator functions
  { map, filter, mapWith }, // supply the transform generator functions
  { reduce, toArray } // supply the reducer functions
)
```

The full version of chainable is made exactly the same way. Here's the gist:

```javascript
import * as sequences from './src/sequences.js'
import * as transforms from './src/transforms.js'
import * as reducers from './src/reducers.js'
import { makeChainableIterable } from './src/makechainable.js'
const chainable = makeChainableIterable(sequences, transforms, reducers)
```

## When To Use

Iterables shine when you need to process a sequence of data synchronously. For example, `IterableFu` dynamically
creates the primary classes. That makes it a bit difficult to write JSDoc for them. So `IterableFu` uses
itself to generate documentation from the functional API documentation. Iterables make it much easier to maintain
state while iterating through a data sequence. A google search on javascript generators and iterables will turn
up many more examples.

If you're performing simple transformations on small amounts of data, then the built in transforms such as Array.map will probably
work just as well. Slightly more complicated would be lodash **link** or underscore **link**. These approaches create a new Array
for each transformation, so can be expensive on large amounts of data.

Iterables provide synchronous pull behavior - the data source is synchronous, and the caller pulls data from the source as needed. **link to stream taxonomy**. Iterables are good if you already have the data you want to transform in memory. If asynchronous push fits
your needs better, an Observable library such as Kefir **link** or RxJs **link** would be preferable. Or you could use async generators.

You can use this library with Observable libraries because they all implement `Observable.from(iterable)`. If you're already
comfortable with the Observable model: Observable, Observer, Subscriber, cold observables, hot observables, etc. Then you can
probably get by without `IterableFu`. I personally find Iterables a lot simpler for smaller projects.

TODO: vs Streams - streams provide backpressure, more specialized, more capable for those use cases I/O. Only now being added to browsers.

```javascript
// Converting from IterableFu to Observable
const iterable = chainable.range(5)
const observaable = Observable.from(iterable)
```

## Alternatives

There are lots of alternatives:



## License

## References

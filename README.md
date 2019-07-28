# IterableFu

`IterableFu` is a small (1.2kb minimized and gzipped) library of functions like range, map, reduce, filter, zip, for iterable objects.

`IterableFu` also provides a chainable iterable to make it easy to chain transform and reduce methods together. Since chainable classes can be a challenge to maintain and extend, `IterableFu` provides a factory that creates the core chainable class, and that makes it easy to build your own custom chainable iterables.

## Features

* Chainable: `chainable([0, 1, 2]).map(x => 2*x).toArray()`
* Works with your generators (and iterables): `chainable.from(yourGenerator).mapWith(yourTransformGenerator)`
* Customizable [makeChainableIterable](docs/makechainable.md)
* Functional API takes data last, so you can curry, pipe and compose with your functional library
* Written in pure ES6 javascript using ES6 modules. Documentation build scripts use ES7 async/await.
* Browser version has no dependencies.
* Build produces minified UMD modules using [Rollup](https://github.com/rollup/rollup).
* Node package uses [esm](https://github.com/standard-things/esm) for the CommonJS interface.

## Table of Contents

<!-- !toc (minlevel=2 omit="Features;Table of Contents") -->

* [Installation](#installation)
* [Getting Started](#getting-started)
* [API](#api)
* [Examples](#examples)
  * [Basics](#basics)
  * [One Time Use](#one-time-use)
  * [Iterablefu and Your Generators](#iterablefu-and-your-generators)
* [When To Use](#when-to-use)
* [Alternatives](#alternatives)
* [Contributing](#contributing)
* [Bugs](#bugs)
* [License](#license)

<!-- toc! -->

## Installation

Use any Github or npm package installation method you prefer. This project uses [pnpm](https://github.com/pnpm/pnpm), but you can use npm too.

```bash
npm install --save iterablefu
```

Browser bundles are built in the bundles directory.

```bash
npm run build
```

## Getting Started

If you want the chainable API, use this import.

```javascript
import { chainable } from 'iterablefu'
```

If you want the functional API, use this import.

```javascript
import { generators, transforms, reducers } from 'iterablefu'
```

## API

Most people will want to use the chainable factory class.

* Chainable API
  * [Chainable factory](docs/chainable.md), builder function for ChainableIterable, [**start here**](docs/chainable.md)
  * [ChainableIterable](docs/ChainableIterable.md), chainable iterable generators, transforms, and reducers
  * [Custom chainables](docs/makechainable.md), create custom chainable iterables
* Functional API
  * [Generators](docs/generators.md), generator functions to create iterable sequences
  * [Transforms](docs/transforms.md), functions to convert an iterable into another iterable (e.g. map, filter)
  * [Reducers](docs/reducers.md), functions to convert an iterable into a value

## Examples

### Basics

`IterableFu` provides three basic categories of functions:

* **Generators** - create an iterable sequence
* **Transforms** - convert one iterable sequence into another
* **Reducers** - convert an iterable sequence into a value

Here's a quick example showing `range` (a generator), `map` (a transform), and `reduce` (a reducer).

```javascript
import { chainable } from 'iterablefu'
const answer =
  chainable
    .range(5) // generates 0, 1, 2, 3, 4
    .map(x => 2 * x) // maps to 0, 2, 4, 6, 8
    .reduce((a, x) => a + x, 0) // 0 + 2 + 4 + 6 + 8 = 20
console.log(answer) // prints 20
```

Some generators can convert Arrays into chainable iterables.

```javascript
const d = chainable([1, 2, 3]) // makes a chainable version of [1, 2, 3]
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

Except for one method, `repeatIterable`, `IterableFu` only supports one-time use. This matches the
intended use of the library, but also reflects what happens when you use generator functions with the library.

[Generator functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#Generator_functions) create [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) objects which are both *iterable* (have `[Symbol.iterator]`) and *iterators* (have `next()`).

Iterators can only be used once. So when you call a generator function to provide an iterable to `IterableFu`, you are
passing a Generator object that can only be iterated once.

Compare this to Array. When you call `Array[Symbol.iterator]()` you get a one-time use Generator. But when you call
`Array[Symbol.iterator]()` again, you get a different one-time use Generator object. This is why you can iterate over
iterable objects like Array more than once.

```javascript
// IterableFu produces one-time use sequences
const a = chainable.range(5)
console.log([...a]) // print [0, 1, 2, 3, 4]
console.log([...a]) // prints [] because the first log statement used the iterable
// This is not a bug, chainable works exactly like generator functions because it uses them internally
```

To reuse an `IterableFu` chain, wrap it in a function so that a new Generator object is returned each time it is called.

```javascript
const fn = () => chainable.range(5)
// Note the function calls below...
console.log([...fn()]) // prints [0, 1, 2, 3, 4]
console.log([...fn()]) // prints [0, 1, 2, 3, 4]
```

### Iterablefu and Your Generators

To use a generator function that creates a sequence, use [chainable](docs/chainable.md) as a function.

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
// mapWith only accepts generator functions that have one parameter: iterable.
// If your generator takes additional parameters beyond iterable, you need
// to wrap it with another function that takes only one parameter.
const wrapper = (iterable) => fn(3, iterable)
const a = chainable(input).mapWith(wrapper).toArray()
console.log(a) // prints [0, 3, 6, 9, 12]
```

## When To Use

Iterables shine when you need to process a sequence of data synchronously and maintain state while doing so. For example, `IterableFu` dynamically creates the primary class [chainable](docs/chainable.md), so there's no place to put the JSDoc
comments. So `IterableFu` generates the documentation by processing the functional API documentation: removing unused parameters, changing indentation, replacing comments, and such. It does this using a chain of `IterableFu` transforms.

A google search on javascript generators and iterables will turn up many more examples.

If you're performing simple transformations on small amounts of data, then the built in transforms such as [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) will probably work just as well. Slightly more complicated would be [lodash](https://github.com/lodash/lodash) or [underscore](https://github.com/jashkenas/underscore). These approaches create a new Array for each transformation, so can be expensive on large amounts of data.

Iterables provide synchronous pull behavior - the data source is synchronous, and the caller pulls data from the source as needed. Iterables are good if you already have the data you want to transform in memory. If asynchronous push fits
your needs better, an Observable library such as [Kefir](https://github.com/kefirjs/kefir) or [RxJs](https://github.com/reactivex/rxjs) would be preferable. Or you could use async generators.

You can use this library with Observable libraries because they all implement `Observable.from(iterable)`. If you're already comfortable with the Observable model: Observable, Observer, Subscriber, cold observables, hot observables, etc. Then you can probably get by without `IterableFu`.

```javascript
// Converting from IterableFu to Observable
const iterable = chainable.range(5)
const observable = Observable.from(iterable)
```

Streams are another alternative. They provide backpressure, and are more specialized and capable for input/output use cases. Streams are only now being supported by browsers, and they are significantly harder to understand than iterables.

## Alternatives

There are lots of alternatives:
- [wu](https://github.com/fitzgen/wu.js) - has many more methods than `IterableFu`. Does not use ES6 modules.
- [itiri](https://github.com/labs42io/itiriri) - many functions that force conversion to array. Typescript.
- [lazy.js](https://github.com/dtao/lazy.js/) - more methods, does not use generators
- [linq.js](https://github.com/mihaifm/linq) - LINQ (a .NET library) for JavaScript
- [GenSequence](https://github.com/Jason3S/GenSequence) - similar to `IterableFu`. Typescript.

... and many more.

## Contributing

Contributions are welcome. Please create a pull request.

## Bugs

TODO: add stuff here

## License

TODO: include MIT license here

# IterableFu

`IterableFu` is a small (1.2kb minimized and gzipped) library of functions like range, map, reduce, filter, zip, for iterable objects.

`IterableFu` has a chainable class to make it easy to chain iterable transforms. There is a chainable class factory
[makeChainableIterable](docs/makechainable.md), so you easily can add methods, or reduce bundle size.

## Features

* Chainable: `chainable([0, 1, 2]).map(x => 2*x).toArray()`.
* Works with your generators (and iterables): `chainable(yourGenerator()).mapWith(yourTransformGenerator)`.
* Customizable [makeChainableIterable](docs/makechainable.md), to add methods or reduce bundle sizes.
* Functional API takes data last, so you can curry, pipe and compose with your functional library.
* Written in ES6 javascript using ES6 modules.

If you want asynchronous iterables along with task pool, event queue, pub/sub, merge, chunk, throttle, and the like, checkout [await-for-it](https://github.com/toolbuilder/await-for-it#readme).

## Table of Contents

<!-- !toc (minlevel=2 omit="Features;Table of Contents") -->

* [Installation](#installation)
* [Getting Started](#getting-started)
* [API](#api)
* [Examples](#examples)
  * [Basics](#basics)
  * [One Time Use](#one-time-use)
  * [Iterablefu and Your Generators](#iterablefu-and-your-generators)
* [Smaller Bundles](#smaller-bundles)
* [Customization](#customization)
* [Alternatives](#alternatives)
* [Contributing](#contributing)
* [Issues](#issues)
* [License](#license)

<!-- toc! -->

## Installation

```bash
npm install --save iterablefu
```

Access UMD packages and map files from [unpkg](https://unpkg.com).

```html
<script src="https://unpkg.com/iterablefu/umd/iterablefu.umd.min.js"></script>
<script src="https://unpkg.com/iterablefu/umd/iterablefu.umd.js"></script>
```

Both UMD packages create a global variable `iterablefu`.

## Getting Started

If you want the chainable API, use this import.

```javascript
import { chainable } from 'iterablefu'
```

If you want the functional API, use this import.

```javascript
import { generators, transforms, reducers } from 'iterablefu'
```

You may also specify the ES modules directly to reduce bundle sizes. See more in the
[Smaller Bundles](#smaller-bundles) section.

The most used methods are probably: `zip`, `zipAll`, `filter`, `flatten`, `map`, and `reduce`.
The documentation has an example for each method:

* [chainable](docs/chainable.md)- Starts the chain and produces a ChainableIterable
* [ChainableIterable](docs/ChainableIterable.md) - For all the transforms and reducer methods

```javascript
import { chainable } from 'iterablefu'

const iterable = chainable([1, 2, 3, 4, 5, 6]) // <-- throw any iterable in here
  .filter(x => x % 2 === 0) // filters out odd numbers
  .map(x => 2 * x)

console.log(Array.from(iterable)) // prints [4, 8, 12]
```

## API

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

Some generators can convert Arrays or any other iterable into chainable iterables.

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

Except for one method, `repeatIterable`, `IterableFu` only supports one-time iteration. This is because
iterators cannot be reused once done.

An iterable class like Array, can be iterated more than once because it produces a new iterator for each iteration.

```javascript
// IterableFu produces one-time use sequences
const a = chainable.range(5)
console.log([...a]) // print [0, 1, 2, 3, 4], iterator is now done
console.log([...a]) // prints [] because the iterator is already done
```

To reuse an `IterableFu` chain, wrap it in a function so that a new Generator object is returned each time it is called.

```javascript
const fn = () => chainable.range(5)
// Note the function calls below...
console.log([...fn()]) // prints [0, 1, 2, 3, 4]
console.log([...fn()]) // prints [0, 1, 2, 3, 4] because a new iterator was used
```

### Iterablefu and Your Generators

To use a generator function that creates a sequence, use [chainable](docs/chainable.md) as a function.

```javascript
// A simple generator function
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
// to wrap it with another function that takes only one parameter. Like this:
const wrapper = (iterable) => fn(3, iterable)
const a = chainable(input).mapWith(wrapper).toArray()
console.log(a) // prints [0, 3, 6, 9, 12]
```

## Smaller Bundles

You can reduce bundle size by importing the generators and function you want to use directly.

```javascript
import { zip, zipAll } from 'iterablefu/src/generators.js'
import { filter, flatten, map } from 'iterablefu/src/transfroms.js'
import { reduce } from 'iterablefu/src/reducers.js'
```

If you want a reduced size chainable object, use [makeChainableIterable](docs/makechainable.md) with the
directly imported functions. Customization is covered more completely in the `makeChainableIterable` docs.

```javascript
// using the imports from above
import { makeChainableIterable } from 'iterablefu/src/makechainable.js'
const generators = { zip, zipAll }
const transforms = { filter, flatten, map }
const reducers = { reduce }
const chainable = makeChainableIterable(generators, transforms, reducers)
```

## Customization

Customization is covered  in the [makeChainableIterable](docs/makechainable.md) documentation.

## Alternatives

There are lots of alternatives:

* [wu](https://github.com/fitzgen/wu.js) - has many more methods than `IterableFu`. Does not use ES6 modules.
* [itiri](https://github.com/labs42io/itiriri) - many functions that force conversion to array. Typescript.
* [lazy.js](https://github.com/dtao/lazy.js/) - more methods, does not use generators
* [linq.js](https://github.com/mihaifm/linq) - LINQ (a .NET library) for JavaScript
* [GenSequence](https://github.com/Jason3S/GenSequence) - similar to `IterableFu`. Typescript.

... and many more.

## Contributing

Contributions are welcome. Please create a pull request.

I use [pnpm](https://pnpm.js.org/) instead of npm.

Automated browser tests use electron. Automated package tests build a `*.tgz` package and run tweaked unit tests in a temporary directory. Use `pnpm run build` to run everything in the right order.

## Issues

This project uses Github issues.

## License

<!-- include (LICENSE) -->
The MIT License (MIT)

Copyright 2019 Kevin Hudson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.<!-- /include -->

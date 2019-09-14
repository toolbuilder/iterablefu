# Customization

The simplest way to extend `IterableFu` is to use the `makeChainableIterable` method to generate your
own version of [chainable](chainable.md). You can use your own methods and methods from `iterablefu`
with `makeChainableIterable`.

## Table of Contents

!toc (minlevel=2 level=3 omit="Table of Contents")

## Usage

This section walks through an example that adds a few simple methods to those already provided by `iterablefu`.
You can also reduce the number of methods the same way. The [README](../README.md) shows a quick example for reducing
bundle size.

### Imports

Import [makeChainableIterable](#makechainableiterable). If you want to use other `Iterablefu` methods, import the functional versions of those too: [generators](generators.md), [transforms](transforms.md), and [reducers](reducers.md).

```javascript
import { makeChainableIterable, generators, transforms, reducers } from 'iterablefu'
```

### Generators

Each generator will appear as a static factory method on your custom class. Your generators can return anything that supports the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol). Typically, you'll provide [generator functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*). However, any method that returns an iterable object will work just fine. For example, an ordinary method that returns an Array would work because Array is iterable. Your generators may take any number of parameters, and yield any sort of sequence.

```javascript
const simpleRange = function * (length) {
  for (let i = 0; i < length; i++) {
    yield i
  }
}
```

### Transform Functions

The transform methods will become chainable methods on the chainable iterable class. These functions can return anything that supports the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol). They do not have to be [generator functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*). Transform methods can have any
number of parameters, but the last one must be the iterable to be transformed.

```javascript
// This transform method returns an anonymous iterable object just to show
// something different than a generator function.
// The iterable to be transformed must be the last parameter.
const multiply = (n, iterable) => {
  return {
    * [Symbol.iterator] () {
      for (let x of iterable) {
        yield n * x
      }
    }
  }
}

// You can implement your method using the functional API methods. Do not use 'this', because
// the generated chainable class methods have a different signature (i.e. no iterable parameter).
// Because map returns an iterable object, byTwo shouldn't be a generator function itself (no asterisk).
const byTwo = function (iterable) {
  return transforms.map(x => 2 * x, iterable)
}
```

### Reducer Functions

Reducer methods become non-chainable methods on the chainable class. Reducer methods can have any number of parameters,
but the last one must be the iterable to be reduced. The return value can be anything.

```javascript
// The last parameter must be the iterable to be reduced
const toSet = function (iterable) {
  return new Set(iterable)
}
```

### Creating Chainable Classes

The [makeChainableIterable](#makechainableiterable) method requires generators, transforms, and reducers. However, any
of those can be empty Objects.

- The generators will have the same method signature as the methods you provide
- The iterable parameter will be removed from the method signatures of the transforms and reducers
because the iterable is provided by the chainable class.

```javascript

// add your methods to the existing ones. In this case, the methods
// are from the examples above.
const customSequences = { ...generators, simpleRange }
const customTransforms = { ...transforms, multiply, byTwo }
const customReducers = { ...reducers, toSet }

const customChainable = makeChainableIterable(customSequences, customTransforms, customReducers)

// Use your new class
const set = customChainable.simpleRange(3).multiply(2).toSet()
```

Both [chainable](chainable.md) and [ChainableIterable](ChainableIterable.md) are generated using `makeChainableIterable`.
You can extend `ChainableIterable` if you wish, but the API for chaining is not public and may change from release to release.

## Extending Chainable

The `makeChainableClass` function starts with a super simple class before mixing in the generators, transducers, and reducers.

```javascript
  const Chainable = class {
    constructor (iterable) {
      this.chainedIterable = iterable
    }

    * [Symbol.iterator] () {
      yield * this.chainedIterable
    }
  }
```

Extend the class after calling `makeChainableClass`. Then if you want a static factory class do this:

```javascript
import { makeChainableClass } from 'iterablefu'
import { makeFactory } from '@toolbuilder/make-factory'

const ChainableIterable = makeChainableClass(generators, transforms, reducers)

class Extended extends ChainableIterable {
  catch (fn, iterable) {
    const doCatch = function * (fn, iterable) {
      try { yield * } catch (e) { fn(e) }
    }
    this.chainedIterable = doCatch(fn, this.chainedIterable)
    return this
  }

  finally (fn, iterable) {
    const doFinally = function * (fn, iterable) {
      try { yield * iterable } finally { fn() }
    }
    this.chainedIterable = doFinally(fn, this.chainedIterable)
    return this
  }
}

const chainable = makeFactory(Extended)

const iterable = chainable([0, 1, 3]).toArray()

```

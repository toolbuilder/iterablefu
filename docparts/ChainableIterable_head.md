# ChainableIterable

The `ChainableIterable` implements chaining for the `IterableFu` package. Typically, instances are created using [chainable](chainable.md) instead of creating `ChainableIterable` directly.

```javascript
import { chainable, ChainableIterable } from 'iterablefu'
const chainableIterable = chainable([1, 2, 3])
console.log(chainableIterable instanceof ChainableIterable) // prints true
```

There is a static constructor method that converts an iterable (including Generator objects) to a chainable iterable.

```javascript
import { ChainableIterable } from 'iterablefu'
const a = ChainableIterable.from([1, 2, 3]).toArray()
console.log(a) // prints [1, 2, 3]
```

There is a constructor that converts an iterable to a chainable iterable.

```javascript
import { ChainableIterable } from 'iterablefu'
const a = new ChainableIterable([1, 2, 3]).toArray()
console.log(a) // prints [1, 2, 3]
```

## Table of Contents

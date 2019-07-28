# Chainable

Chainable provides generator functions for building [chainable iterables](ChainableIterable.md).

The key difference between chainable and [ChainableIterable](ChainableIterable.md) is that chainable can
be called as a function to start the chain. This can result in more compact notation.

## Chainable As Function

Chainable can be called as a function to convert an iterable to a chainable iterable.

### Parameters

- `iterable` **Iterable** - iterable to make chainable

### Examples

```javascript
import { chainable } from 'iterablefu'
const a = chainable([1, 2, 3]).map(x => x * x).toArray()
console.log(a) // prints [1, 4, 9]
```

Returns [ChainableIterable](ChainableIterable.md)

## Table of Contents

# Chainable

Chainable builds a new iterable from an input iterable and a sequence of transformations.

## Chainable As Function

Chainable can be called as a function to convert an iterable to a chainable iterable.

### Parameters

- `iterable` **Iterable** - iterable to make chainable

### Examples

```javascript
import { chainable } from './src/chainable.js'
const a = chainable([1, 2, 3]).map(x => x * x).toArray()
console.log(a) // prints [1, 4, 9]
```

Returns **Generator** that is a chainable iterable


## Table of Contents


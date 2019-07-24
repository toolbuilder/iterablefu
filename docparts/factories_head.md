# Factory Methods

Factory methods to create an iterable sequence from something else.

## Usage

The simplest way to import all the factory methods is to use the full package.

```javascript
import { sequences } from 'iterablefu'
console.log(...sequences.range(5)) // prints 0 1 2 3 4
```

To minimize dependencies to support tree-shaking, import individual functions.

```javascript
import { range } from './src/sequences.js'
console.log(...range(5)) // prints 0 1 2 3 4
```

## Table of Contents

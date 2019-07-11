import { makeChainableIterable, makeChainableClass } from './makechainable.js'
import * as sequences from './sequences.js'
import * as transforms from './transforms.js'
import * as reducers from './reducers.js'

// Create an easy default chainable iterator builder for common use case
const chainable = makeChainableIterable(sequences, transforms, reducers)
const ChainableIterable = chainable.ChainableIterable

// Everything has been imported and used (visibly or not) to build chainable
// No unnecessary dependencies created by exporting everything, and it is
// convenient for users.
export {
  chainable,
  ChainableIterable,
  makeChainableClass,
  makeChainableIterable,
  sequences,
  transforms,
  reducers
}

import { makeChainableIterable, makeChainableClass } from './makechainable.js'
import { makeFactory } from '@toolbuilder/make-factory'
import * as generators from './generators.js'
import * as transforms from './transforms.js'
import * as reducers from './reducers.js'

const ChainableIterable = makeChainableClass(generators, transforms, reducers)
const chainable = makeFactory(ChainableIterable)

// Everything has been imported and used (visibly or not) to build chainable
// No unnecessary dependencies created by exporting everything, and it is
// convenient for users.
export {
  chainable,
  ChainableIterable,
  makeChainableClass,
  makeChainableIterable,
  generators,
  transforms,
  reducers
}

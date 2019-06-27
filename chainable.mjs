import ChainableFactory from './chainable_factory'
import Sequences from './sequences'
import Transforms from './transforms'
import Reducers from './reducers'

const factory = new ChainableFactory(Sequences, Transforms, Reducers)
const chainable = factory.createBuilder(Sequences, Transforms, Reducers)
/**
 * Support easy customization by providing a builder function, and
 * the standard set of sequences, transforms, and reducers.
*/
const customBuilder = function (sequences, transforms, reducers) {
  return factory.createBuilder(sequences, transforms, reducers)
}
// add properties as starting point for users
customBuilder.sequences = Sequences
customBuilder.transforms = Transforms
customBuilder.reducers = Reducers

export {
  chainable,
  customBuilder
}

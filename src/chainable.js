import createBuilder from './chainable_factory'
import Sequences from './sequences'
import Transforms from './transforms'
import Reducers from './reducers'

/**
 * Create an easy default chainable iterator builder.
 */
const chainable = createBuilder(Sequences, Transforms, Reducers)
/**
 * Support easy customization by providing a builder function, and
 * the standard set of sequences, transforms, and reducers.
*/
const customBuilder = function (sequences, transforms, reducers) {
  return createBuilder(sequences, transforms, reducers)
}

// add properties as starting point for users
customBuilder.sequences = Sequences
customBuilder.transforms = Transforms
customBuilder.reducers = Reducers

// TODO: Consider plugin pattern .useTransform, .useSequence,.useReducer, etc??

export {
  chainable,
  customBuilder
}

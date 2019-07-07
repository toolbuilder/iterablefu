# Iterator Functions

higher order functions (such as map, filter, and reduce) for ECMAScript 6 iterators. 
wrapper for JavaScript Generators

Use your observable library to create an observable from an iterable using Observable.from(...iterable)

The Generator object is returned by a generator function and it conforms to both the iterable protocol and the iterator protocol.

The Iterable Protocol defines the iteration behavior of objects. An iterable has a [Symbol.iterator] () that returns an iterator. It could be a generator function that uses yield (needs asterisk). Or it could simply return an iterator (no asterisk). Often I return the iterator using the iterator protocol method.

The iterator protocol defines a standard way to produce a sequence of values (either finite or infinite), and potentially a return value when all values have been generated. An iterator provides a next() method that returns { value, done } objects.

# API

# Iterator Functions

higher order functions (such as map, filter, and reduce) for ECMAScript 6 iterators. 
wrapper for JavaScript Generators

Use your observable library to create an observable from an iterable using Observable.from(...iterable)

The Generator object is returned by a generator function and it conforms to both the iterable protocol and the iterator protocol.

The Iterable Protocol defines the iteration behavior of objects. An iterable has a [Symbol.iterator] () that returns an iterator. It could be a generator function that uses yield (needs asterisk). Or it could simply return an iterator (no asterisk). Often I return the iterator using the iterator protocol method.

The iterator protocol defines a standard way to produce a sequence of values (either finite or infinite), and potentially a return value when all values have been generated. An iterator provides a next() method that returns { value, done } objects.


* async(iterable) - convert to async iterator, which provides a sequence of promises - not chainable with if
* chain(...iterables) - single iterator from consecutive iterators
* chunk(n, iterable); fi(iterable).chunk(n) - accumulate into sequence of Arrays of size n, curried
* curry(generator) - make a curried generator(what's the right terminology here?)(used internally to make curried)
* filter(fn, iterable) - yield only items for which fn is truthy, curried
* flatten(fn, iterable) - const { iterate, itemToYield } = fn(item), a customizable flatten
* forEach(fn, iterable) - execute fn for each value in sequence, curried
* NO! from(generator) - just call the generator() to get an iterable
* map(fn, iterable)
* pipe(...iterators) - instead of chaining, compose iterators
* pluck(propertyname, iterable) - curried
* range() - generates a sequence - how (or if) to make this curried?
* reduce(fn, initial, iterable) - curried
* reject(fn, iterable) - For each item in the iterable, yield the item if !fn(item) is truthy. curried
* repeat(n, thing) - repeat thing n times
* take(n, iterable) curried, Yield the first n items from the iterable Original iterator can still be used
* takeWhile(fn, iterable) curried, Yield items from the iterable while fn(item) is truthy. Original iterator can still be used
* tap(fn, iterable) curried - call fn but yield item
* toArray()
* unzip(n, iterable) curried - Given an iterable whose items are of the form [a, b, c, ...], return an array of iterators of the form [as, bs, cs, ...].
* zip(...iterables)
* zipLongest(default, ...iterables)

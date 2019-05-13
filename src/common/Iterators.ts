/**
 * Lazy iterators to work on dynamic data sets without materializing them.
 * 
 * They allow to work on infinite streams of values, with limited memory consumption.
 * 
 * Functions in this file that do not return an Iterable are "materializing", meaning that they
 * may consume iterators up to the end, and will not work well on infinite iterators.
 * 
 * These iterators are guaranteed to be repeatable, meaning that calling Symbol.iterator on them will start over.
 */
module TK {
    /**
     * Empty iterator
     */
    export const IATEND: Iterator<any> = {
        next: function () {
            return { done: true, value: undefined };
        }
    }

    /**
     * Empty iterable
     */
    export const IEMPTY: Iterable<any> = {
        [Symbol.iterator]: () => IATEND
    }

    /**
     * Iterable constructor, from an initial value, and a step value
     */
    export function irecur<T, S>(start: T, step: (a: T) => T | null): Iterable<T> {
        return {
            [Symbol.iterator]: function* () {
                let val: T | null = start;
                do {
                    yield val;
                    val = step(val);
                } while (val !== null);
            }
        }
    }

    /**
     * Iterable constructor, from an array
     * 
     * The iterator will yield the next value each time it is called, then undefined when the array's end is reached.
     */
    export function iarray<T>(array: T[], offset = 0): Iterable<T> {
        return {
            [Symbol.iterator]: function () {
                return array.slice(offset)[Symbol.iterator]();
            }
        }
    }

    /**
     * Iterable constructor, from a single value
     * 
     * The value will be yielded only once, not repeated over.
     */
    export function isingle<T>(value: T): Iterable<T> {
        return iarray([value]);
    }

    /**
     * Iterable that repeats the same value.
     */
    export function irepeat<T>(value: T, count = -1): Iterable<T> {
        return {
            [Symbol.iterator]: function* () {
                let n = count;
                while (n != 0) {
                    yield value;
                    n--;
                }
            }
        }
    }

    /**
     * Equivalent of Array.forEach for all iterables.
     * 
     * If the callback returns *stopper*, the iteration is stopped.
     */
    export function iforeach<T>(iterable: Iterable<T>, callback: (_: T) => any, stopper: any = null): void {
        for (let value of iterable) {
            if (callback(value) === stopper) {
                break;
            }
        }
    }

    /**
     * Returns the first item passing a predicate
     */
    export function ifirst<T>(iterable: Iterable<T>, predicate: (item: T) => boolean): T | null {
        for (let value of iterable) {
            if (predicate(value)) {
                return value;
            }
        }
        return null;
    }

    /**
     * Returns the first non-null result of a value-yielding predicate, applied to each iterator element
     */
    export function ifirstmap<T1, T2>(iterable: Iterable<T1>, predicate: (item: T1) => T2 | null): T2 | null {
        for (let value of iterable) {
            let res = predicate(value);
            if (res !== null) {
                return res;
            }
        }
        return null;
    }

    /**
     * Materialize an array from consuming an iterable
     * 
     * To avoid materializing infinite iterators (and bursting memory), the item count is limited to 1 million, and an
     * exception is thrown when this limit is reached.
     */
    export function imaterialize<T>(iterable: Iterable<T>, limit = 1000000): T[] {
        let result: T[] = [];

        for (let value of iterable) {
            result.push(value);
            if (result.length >= limit) {
                throw new Error("Length limit on iterator materialize");
            }
        }

        return result;
    }

    /**
     * Iterate over natural integers
     * 
     * If *count* is not specified, the iterator is infinite
     */
    export function irange(count: number = -1, start = 0, step = 1): Iterable<number> {
        return {
            [Symbol.iterator]: function* () {
                let i = start;
                let n = count;
                while (n != 0) {
                    yield i;
                    i += step;
                    n--;
                }
            }
        }
    }

    /**
     * Iterate over numbers, by applying a step taken from an other iterator
     * 
     * This iterator stops when the "step iterator" stops
     * 
     * With no argument, istep() == irange()
     */
    export function istep(start = 0, step_iterable = irepeat(1)): Iterable<number> {
        return {
            [Symbol.iterator]: function* () {
                let i = start;
                yield i;
                for (let step of step_iterable) {
                    i += step;
                    yield i;
                }
            }
        }
    }

    /**
     * Skip a given number of values from an iterator, discarding them.
     */
    export function iskip<T>(iterable: Iterable<T>, count = 1): Iterable<T> {
        return {
            [Symbol.iterator]: function () {
                let iterator = iterable[Symbol.iterator]();
                let n = count;
                while (n-- > 0) {
                    iterator.next();
                }
                return iterator;
            }
        }
    }

    /**
     * Return the value at a given position in the iterator
     */
    export function iat<T>(iterable: Iterable<T>, position: number): T | null {
        if (position < 0) {
            return null;
        } else {
            if (position > 0) {
                iterable = iskip(iterable, position);
            }
            let iterator = iterable[Symbol.iterator]();
            let state = iterator.next();
            return state.done ? null : state.value;
        }
    }

    /**
     * Chain an iterable of iterables.
     * 
     * This will yield values from the first yielded iterator, then the second one, and so on...
     */
    export function ichainit<T>(iterables: Iterable<Iterable<T>>): Iterable<T> {
        return {
            [Symbol.iterator]: function* () {
                for (let iterable of iterables) {
                    for (let value of iterable) {
                        yield value;
                    }
                }
            }
        }
    }

    /**
     * Chain iterables.
     * 
     * This will yield values from the first iterator, then the second one, and so on...
     */
    export function ichain<T>(...iterables: Iterable<T>[]): Iterable<T> {
        if (iterables.length == 0) {
            return IEMPTY;
        } else {
            return ichainit(iterables);
        }
    }

    /**
     * Loop an iterator for a number of times.
     * 
     * If count is negative, if will loop forever (infinite iterator).
     * 
     * onloop may be used to know when the iterator resets.
     */
    export function iloop<T>(base: Iterable<T>, count = -1, onloop?: Function): Iterable<T> {
        return {
            [Symbol.iterator]: function* () {
                let n = count;
                let start = false;
                while (n-- != 0) {
                    for (let value of base) {
                        if (start) {
                            if (onloop) {
                                onloop();
                            }
                            start = false;
                        }
                        yield value;
                    }
                    start = true;
                }
            }
        }
    }

    /**
     * Iterator version of "map".
     */
    export function imap<T1, T2>(iterable: Iterable<T1>, mapfunc: (_: T1) => T2): Iterable<T2> {
        return {
            [Symbol.iterator]: function* () {
                for (let value of iterable) {
                    yield mapfunc(value);
                }
            }
        }
    }

    /**
     * Iterator version of "reduce".
     */
    export function ireduce<T>(iterable: Iterable<T>, reduce: (item1: T, item2: T) => T, init: T): T {
        let result = init;
        for (let value of iterable) {
            result = reduce(result, value);
        }
        return result;
    }

    /**
     * Iterator version of "filter".
     */
    export function ifilter<T>(iterable: Iterable<T>, filterfunc: (_: T) => boolean): Iterable<T> {
        return {
            [Symbol.iterator]: function* () {
                for (let value of iterable) {
                    if (filterfunc(value)) {
                        yield value;
                    }
                }
            }
        }
    }

    /**
     * Type filter, to return a list of instances of a given type
     */
    export function ifiltertype<T>(iterable: Iterable<any>, filter: (item: any) => item is T): Iterable<T> {
        return ifilter(iterable, filter);
    }

    /**
     * Class filter, to return a list of instances of a given type
     */
    export function ifilterclass<T>(iterable: Iterable<any>, classref: { new(...args: any[]): T }): Iterable<T> {
        return ifilter(iterable, (item): item is T => item instanceof classref);
    }

    /**
     * Combine two iterables.
     * 
     * This iterates through the second one several times, so if one iterator may be infinite, 
     * it should be the first one.
     */
    export function icombine<T1, T2>(it1: Iterable<T1>, it2: Iterable<T2>): Iterable<[T1, T2]> {
        return ichainit(imap(it1, v1 => imap(it2, (v2): [T1, T2] => [v1, v2])));
    }

    /**
     * Advance through two iterables at the same time, yielding item pairs
     * 
     * Iteration will stop at the first of the two iterators that stops.
     */
    export function izip<T1, T2>(it1: Iterable<T1>, it2: Iterable<T2>): Iterable<[T1, T2]> {
        return {
            [Symbol.iterator]: function* () {
                let iterator1 = it1[Symbol.iterator]();
                let iterator2 = it2[Symbol.iterator]();
                let state1 = iterator1.next();
                let state2 = iterator2.next();
                while (!state1.done && !state2.done) {
                    yield [state1.value, state2.value];
                    state1 = iterator1.next();
                    state2 = iterator2.next();
                }
            }
        }
    }

    /**
     * Advance two iterables at the same time, yielding item pairs (greedy version)
     * 
     * Iteration will stop when both iterators are consumed, returning partial couples (undefined in the peer) if needed.
     */
    export function izipg<T1, T2>(it1: Iterable<T1>, it2: Iterable<T2>): Iterable<[T1 | undefined, T2 | undefined]> {
        return {
            [Symbol.iterator]: function* () {
                let iterator1 = it1[Symbol.iterator]();
                let iterator2 = it2[Symbol.iterator]();
                let state1 = iterator1.next();
                let state2 = iterator2.next();
                while (!state1.done || !state2.done) {
                    yield [state1.value, state2.value];
                    state1 = iterator1.next();
                    state2 = iterator2.next();
                }
            }
        }
    }

    /**
     * Partition in two iterables, one with values that pass the predicate, the other with values that don't
     */
    export function ipartition<T>(iterable: Iterable<T>, predicate: (item: T) => boolean): [Iterable<T>, Iterable<T>] {
        return [ifilter(iterable, predicate), ifilter(iterable, x => !predicate(x))];
    }

    /**
     * Alternate between several iterables (pick one from the first one, then one from the second...)
     */
    export function ialternate<T>(iterables: Iterable<T>[]): Iterable<T> {
        return {
            [Symbol.iterator]: function* () {
                let iterators = iterables.map(iterable => iterable[Symbol.iterator]());
                let done: boolean;
                do {
                    done = false;
                    // TODO Remove "dried-out" iterators
                    for (let iterator of iterators) {
                        let state = iterator.next();
                        if (!state.done) {
                            done = true;
                            yield state.value;
                        }
                    }
                } while (done);
            }
        }
    }

    /**
     * Yield items from an iterator only once.
     * 
     * Beware that even if this function is not materializing, it keeps track of yielded item, and may choke on
     * infinite or very long streams. Thus, no more than *limit* items will be yielded (an error is thrown
     * when this limit is reached).
     * 
     * This function is O(n²)
     */
    export function iunique<T>(iterable: Iterable<T>, limit = 1000000): Iterable<T> {
        return {
            [Symbol.iterator]: function* () {
                let done: T[] = [];
                let n = limit;
                for (let value of iterable) {
                    if (!contains(done, value)) {
                        if (n-- > 0) {
                            done.push(value);
                            yield value;
                        } else {
                            throw new Error("Unique count limit on iterator");
                        }
                    }
                }
            }
        }
    }

    /**
     * Common reduce shortcuts
     */
    export const isum = (iterable: Iterable<number>) => ireduce(iterable, (a, b) => a + b, 0);
    export const icat = (iterable: Iterable<string>) => ireduce(iterable, (a, b) => a + b, "");
    export const imin = (iterable: Iterable<number>) => ireduce(iterable, Math.min, Infinity);
    export const imax = (iterable: Iterable<number>) => ireduce(iterable, Math.max, -Infinity);
}

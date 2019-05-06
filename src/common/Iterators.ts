/**
 * Lazy iterators to work on dynamic data sets without materializing them.
 * 
 * They allow to work on infinite streams of values, with limited memory consumption.
 * 
 * Functions in this file that do not return an Iterator are "materializing", meaning that they
 * may consume iterators up to the end, and will not work well on infinite iterators.
 */
module TK {
    /**
     * An iterator is a function without side effect, that returns the current value
     * and an iterator over the next values.
     */
    export type Iterator<T> = () => [T | null, Iterator<T>];

    function _getIEND(): [null, Iterator<any>] {
        return [null, _getIEND];
    }

    /**
     * IEND is a return value for iterators, indicating end of iteration.
     */
    export const IEND: [null, Iterator<any>] = [null, _getIEND];

    /**
     * Empty iterator, returning IEND
     */
    export const IEMPTY = () => IEND;

    /**
     * Equivalent of Array.forEach for lazy iterators.
     * 
     * If the callback returns *stopper*, the iteration is stopped.
     */
    export function iforeach<T>(iterator: Iterator<T>, callback: (_: T) => any, stopper: any = null) {
        let value: T | null;
        [value, iterator] = iterator();
        while (value !== null) {
            let returned = callback(value);
            if (returned === stopper) {
                return;
            }
            [value, iterator] = iterator();
        }
    }

    /**
     * Get an iterator on an array
     * 
     * The iterator will yield the next value each time it is called, then null when the array's end is reached.
     */
    export function iarray<T>(array: T[], offset = 0): Iterator<T> {
        return () => {
            if (offset < array.length) {
                return [array[offset], iarray(array, offset + 1)];
            } else {
                return IEND;
            }
        }
    }

    /**
     * Get an iterator yielding a single value
     */
    export function isingle<T>(value: T): Iterator<T> {
        return iarray([value]);
    }

    /**
     * Returns the first item passing a predicate
     */
    export function ifirst<T>(iterator: Iterator<T>, predicate: (item: T) => boolean): T | null {
        let result: T | null = null;
        iforeach(iterator, item => {
            if (predicate(item)) {
                result = item;
                return null;
            } else {
                return undefined;
            }
        });
        return result;
    }

    /**
     * Returns the first non-null result of a value-yielding predicate, applied to each iterator element
     */
    export function ifirstmap<T1, T2>(iterator: Iterator<T1>, predicate: (item: T1) => T2 | null): T2 | null {
        let result: T2 | null = null;
        iforeach(iterator, item => {
            let mapped = predicate(item);
            if (mapped) {
                result = mapped;
                return null;
            } else {
                return undefined;
            }
        });
        return result;
    }

    /**
     * Materialize an array from consuming an iterator
     * 
     * To avoid materializing infinite iterators (and bursting memory), the item count is limited to 1 million, and an
     * exception is thrown when this limit is reached.
     */
    export function imaterialize<T>(iterator: Iterator<T>, limit = 1000000): T[] {
        let result: T[] = [];
        iforeach(iterator, value => {
            result.push(value);
            if (result.length >= limit) {
                throw new Error("Length limit on iterator materialize");
            }
        });
        return result;
    }

    /**
     * Iterate over natural integers
     * 
     * If *count* is not specified, the iterator is infinite
     */
    export function irange(count: number = -1, start = 0, step = 1): Iterator<number> {
        return () => (count != 0) ? [start, irange(count - 1, start + step, step)] : IEND;
    }

    /**
     * Iterate over numbers, by applying a step taken from an other iterator
     * 
     * This iterator stops when the "step iterator" stops
     * 
     * With no argument, istep() == irange()
     */
    export function istep(start = 0, step = irepeat(1)): Iterator<number> {
        return () => {
            let [value, iterator] = step();
            return [start, value === null ? IEMPTY : istep(start + value, iterator)];
        }
    }

    /**
     * Skip a given number of values from an iterator, discarding them.
     */
    export function iskip<T>(iterator: Iterator<T>, count = 1): Iterator<T> {
        let value: T | null;
        while (count--) {
            [value, iterator] = iterator();
        }
        return iterator;
    }

    /**
     * Return the value at a given position in the iterator
     */
    export function iat<T>(iterator: Iterator<T>, position: number): T | null {
        if (position < 0) {
            return null;
        } else {
            if (position > 0) {
                iterator = iskip(iterator, position);
            }
            return iterator()[0];
        }
    }

    /**
     * Chain an iterator of iterators.
     * 
     * This will yield values from the first yielded iterator, then the second one, and so on...
     */
    export function ichainit<T>(iterators: Iterator<Iterator<T>>): Iterator<T> {
        return function () {
            let [iterators_head, iterators_tail] = iterators();
            if (iterators_head == null) {
                return IEND;
            } else {
                let [head, tail] = iterators_head();
                while (head == null) {
                    [iterators_head, iterators_tail] = iterators_tail();
                    if (iterators_head == null) {
                        break;
                    }
                    [head, tail] = iterators_head();
                }
                return [head, ichain(tail, ichainit(iterators_tail))];
            }
        }
    }

    /**
     * Chain iterators.
     * 
     * This will yield values from the first iterator, then the second one, and so on...
     */
    export function ichain<T>(...iterators: Iterator<T>[]): Iterator<T> {
        if (iterators.length == 0) {
            return IEMPTY;
        } else {
            return ichainit(iarray(iterators));
        }
    }

    /**
     * Wrap an iterator, calling *onstart* when the first value of the wrapped iterator is yielded.
     */
    function ionstart<T>(iterator: Iterator<T>, onstart: Function): Iterator<T> {
        return () => {
            let [head, tail] = iterator();
            if (head !== null) {
                onstart();
            }
            return [head, tail];
        }
    }

    /**
     * Iterator that repeats the same value.
     */
    export function irepeat<T>(value: T, count = -1): Iterator<T> {
        return iloop(iarray([value]), count);
    }

    /**
     * Loop an iterator for a number of times.
     * 
     * If count is negative, if will loop forever (infinite iterator).
     * 
     * onloop may be used to know when the iterator resets.
     */
    export function iloop<T>(base: Iterator<T>, count = -1, onloop?: Function): Iterator<T> {
        if (count == 0) {
            return IEMPTY;
        } else {
            let next = onloop ? ionstart(base, onloop) : base;
            return ichainit(() => [base, iarray([iloop(next, count - 1)])]);
        }
    }

    /**
     * Iterator version of "map".
     */
    export function imap<T1, T2>(iterator: Iterator<T1>, mapfunc: (_: T1) => T2): Iterator<T2> {
        return () => {
            let [head, tail] = iterator();
            if (head === null) {
                return IEND;
            } else {
                return [mapfunc(head), imap(tail, mapfunc)];
            }
        }
    }

    /**
     * Iterator version of "reduce".
     */
    export function ireduce<T>(iterator: Iterator<T>, reduce: (item1: T, item2: T) => T, init: T): T {
        let result = init;
        iforeach(iterator, item => {
            result = reduce(result, item);
        });
        return result;
    }

    /**
     * Iterator version of "filter".
     */
    export function ifilter<T>(iterator: Iterator<T>, filterfunc: (_: T) => boolean): Iterator<T> {
        return () => {
            let [value, iter] = iterator();
            while (value !== null && !filterfunc(value)) {
                [value, iter] = iter();
            }
            return [value, ifilter(iter, filterfunc)];
        }
    }

    /**
     * Combine two iterators.
     * 
     * This iterates through the second one several times, so if one iterator may be infinite, 
     * it should be the first one.
     */
    export function icombine<T1, T2>(it1: Iterator<T1>, it2: Iterator<T2>): Iterator<[T1, T2]> {
        return ichainit(imap(it1, v1 => imap(it2, (v2): [T1, T2] => [v1, v2])));
    }

    /**
     * Advance two iterators at the same time, yielding item pairs
     * 
     * Iteration will stop at the first of the two iterators that stops.
     */
    export function izip<T1, T2>(it1: Iterator<T1>, it2: Iterator<T2>): Iterator<[T1, T2]> {
        return () => {
            let [val1, nit1] = it1();
            let [val2, nit2] = it2();
            if (val1 !== null && val2 !== null) {
                return [[val1, val2], izip(nit1, nit2)];
            } else {
                return IEND;
            }
        }
    }

    /**
     * Advance two iterators at the same time, yielding item pairs (greedy version)
     * 
     * Iteration will stop when both iterators are consumed, returning partial couples (null in the peer) if needed.
     */
    export function izipg<T1, T2>(it1: Iterator<T1>, it2: Iterator<T2>): Iterator<[T1 | null, T2 | null]> {
        return () => {
            let [val1, nit1] = it1();
            let [val2, nit2] = it2();
            if (val1 === null && val2 === null) {
                return IEND;
            } else {
                return [[val1, val2], izipg(nit1, nit2)];
            }
        }
    }

    /**
     * Partition in two iterators, one with values that pass the predicate, the other with values that don't
     */
    export function ipartition<T>(it: Iterator<T>, predicate: (item: T) => boolean): [Iterator<T>, Iterator<T>] {
        return [ifilter(it, predicate), ifilter(it, x => !predicate(x))];
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
    export function iunique<T>(it: Iterator<T>, limit = 1000000): Iterator<T> {
        function internal(it: Iterator<T>, limit: number, done: T[]): Iterator<T> {
            let [value, iterator] = it();
            while (value !== null && contains(done, value)) {
                [value, iterator] = iterator();
            }
            if (value === null) {
                return IEMPTY;
            } else if (limit <= 0) {
                throw new Error("Unique count limit on iterator");
            } else {
                let head = value;
                return () => [head, internal(it, limit - 1, done.concat([head]))];
            }
        }
        return internal(it, limit, []);
    }

    /**
     * Common reduce shortcuts
     */
    export const isum = (iterator: Iterator<number>) => ireduce(iterator, (a, b) => a + b, 0);
    export const icat = (iterator: Iterator<string>) => ireduce(iterator, (a, b) => a + b, "");
    export const imin = (iterator: Iterator<number>) => ireduce(iterator, Math.min, Infinity);
    export const imax = (iterator: Iterator<number>) => ireduce(iterator, Math.max, -Infinity);
}

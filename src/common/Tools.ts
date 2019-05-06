/**
 * Various utility functions.
 */
module TK {
    /**
     * Functions that does nothing (useful for default callbacks)
     */
    export function nop(): void {
    }

    /**
     * Identity function (returns the sole argument untouched)
     */
    export function identity<T>(input: T): T {
        return input;
    }

    /**
     * Check a value for a boolean equivalent
     */
    export function bool<T>(value: T | null | undefined): value is T;
    export function bool(value: any): boolean {
        if (!value) {
            return false;
        } else if (typeof value == "object") {
            return Object.keys(value).length > 0;
        } else {
            return true;
        }
    }

    /**
     * Return a default value if the given one is undefined
     */
    export function coalesce(value: string | null | undefined, fallback: string): string;
    export function coalesce(value: number | null | undefined, fallback: number): number;
    export function coalesce<T>(value: T | null | undefined, fallback: T): T {
        if (typeof value == "undefined" || value === null) {
            return fallback;
        } else {
            return value;
        }
    }

    /**
     * Check for an object being an instance of a type, an returns casted version
     * 
     * Throws an error on failure to cast
     */
    export function as<T>(classref: { new(...args: any[]): T }, obj: any): T {
        if (obj instanceof classref) {
            return obj;
        } else {
            console.error("Bad cast", obj, classref);
            throw new Error("Bad cast");
        }
    }

    /**
     * Apply a functor on the result of another function
     */
    export function fmap<U, V>(g: (arg: U) => V, f: (...args: any[]) => U): (...args: any[]) => V {
        // TODO variadic typing, as soon as supported by typescript
        return (...args) => g(f(...args));
    }

    /**
     * Apply a default value to nulls or undefineds returned by a function
     */
    export function nnf<T>(fallback: T, f: (...args: any[]) => T | null): (...args: any[]) => T {
        return fmap(val => val === null ? fallback : val, f);
    }

    /**
     * Check if a value if null, throwing an exception if its the case
     */
    export function nn<T>(value: T | null): T {
        if (value === null) {
            throw new Error("Null value");
        } else {
            return value;
        }
    }

    /**
     * Remove null values from an array
     */
    export function nna<T>(array: (T | null)[]): T[] {
        return <T[]>array.filter(item => item !== null);
    }

    /**
     * Compare operator, that can be used in sort() calls.
     */
    export function cmp(a: any, b: any, reverse = false): number {
        if (a > b) {
            return reverse ? -1 : 1;
        } else if (a < b) {
            return reverse ? 1 : -1;
        } else {
            return 0;
        }
    }

    /**
     * Clamp a value in a range.
     */
    export function clamp<T>(value: T, min: T, max: T): T {
        if (value < min) {
            return min;
        } else if (value > max) {
            return max;
        } else {
            return value;
        }
    }

    /**
     * Perform a linear interpolation between two values (factor is between 0 and 1).
     */
    export function lerp(factor: number, min: number, max: number): number {
        return min + (max - min) * factor;
    }

    /**
     * Make a deep copy of any object.
     * 
     * Serializer is used for this, and needs a namespace to work.
     * 
     * Please be aware that contained RObjects will be duplicated, but keep their ID, thus breaking the uniqueness.
     */
    export function duplicate<T>(obj: T, namespace: Object = TK): T {
        let serializer = new Serializer(namespace);
        let serialized = serializer.serialize({ dat: obj });
        return serializer.unserialize(serialized).dat;
    }

    /**
     * Make a shallow copy of an array.
     */
    export function acopy<T>(input: T[]): T[] {
        return input.slice();
    }

    /**
     * Call a function for each member of an array, sorted by a key.
     */
    export function itersorted<T>(input: T[], keyfunc: (item: T) => any, callback: (item: T) => void): void {
        var array = acopy(input);
        array.sort((item1, item2) => cmp(keyfunc(item1), keyfunc(item2)));
        array.forEach(callback);
    }

    /**
     * Capitalize the first letter of an input string.
     */
    export function capitalize(input: string): string {
        return input.charAt(0).toLocaleUpperCase() + input.slice(1);
    };

    /**
     * Check if an array contains an item.
     */
    export function contains<T>(array: T[], item: T): boolean {
        return array.indexOf(item) >= 0;
    }

    /**
     * Produce an n-sized array, with integers counting from 0
     */
    export function range(n: number): number[] {
        var result: number[] = [];
        for (var i = 0; i < n; i++) {
            result.push(i);
        }
        return result;
    }

    /**
     * Produce an array of couples, build from the common length of two arrays
     */
    export function zip<T1, T2>(array1: T1[], array2: T2[]): [T1, T2][] {
        var result: [T1, T2][] = [];
        var n = (array1.length > array2.length) ? array2.length : array1.length;
        for (var i = 0; i < n; i++) {
            result.push([array1[i], array2[i]]);
        }
        return result;
    }

    /**
     * Produce two arrays, build from an array of couples
     */
    export function unzip<T1, T2>(array: [T1, T2][]): [T1[], T2[]] {
        return [array.map(x => x[0]), array.map(x => x[1])];
    }

    /**
     * Partition a list by a predicate, returning the items that pass the predicate, then the ones that don't pass it
     */
    export function binpartition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
        let pass: T[] = [];
        let fail: T[] = [];
        array.forEach(item => (predicate(item) ? pass : fail).push(item));
        return [pass, fail];
    }

    /**
     * Yields the neighbors tuple list
     */
    export function neighbors<T>(array: T[], wrap = false): [T, T][] {
        var result: [T, T][] = [];
        if (array.length > 0) {
            var previous = array[0];
            for (var i = 1; i < array.length; i++) {
                result.push([previous, array[i]]);
                previous = array[i];
            }
            if (wrap) {
                result.push([previous, array[0]]);
            }
            return result;
        } else {
            return [];
        }
    }

    /**
     * Type filter, to return a list of instances of a given type
     */
    export function tfilter<T>(array: any[], filter: (item: any) => item is T): T[] {
        return array.filter(filter);
    }

    /**
     * Class filter, to return a list of instances of a given type
     */
    export function cfilter<T>(array: any[], classref: { new(...args: any[]): T }): T[] {
        return array.filter((item): item is T => item instanceof classref);
    }

    /**
     * Flatten a list of lists
     */
    export function flatten<T>(array: T[][]): T[] {
        return array.reduce((a, b) => a.concat(b), []);
    }

    /**
     * Count each element in an array
     */
    export function counter<T>(array: T[], equals: (a: T, b: T) => boolean = (a, b) => a === b): [T, number][] {
        var result: [T, number][] = [];
        array.forEach(item => {
            var found = first(result, iter => equals(iter[0], item));
            if (found) {
                found[1]++;
            } else {
                result.push([item, 1]);
            }
        });
        return result;
    }

    /**
     * Return the first element of the array that matches the predicate, null if not found
     */
    export function first<T>(array: T[], predicate: (item: T) => boolean): T | null {
        for (var i = 0; i < array.length; i++) {
            if (predicate(array[i])) {
                return array[i];
            }
        }
        return null;
    }

    /**
     * Return whether if any element in the array matches the predicate
     */
    export function any<T>(array: T[], predicate: (item: T) => boolean): boolean {
        return first(array, predicate) != null;
    }

    /**
     * Return an iterator over an array
     * 
     * An iterator is a function yielding the next value each time, until the end of array where it yields null.
     * 
     * For more powerful iterators, see Iterators
     */
    export function iterator<T>(array: T[]): () => T | null {
        let i = 0;
        return () => (i < array.length) ? array[i++] : null;
    }

    /**
     * Iterate a list of (key, value) in an object.
     */
    export function iteritems<T>(obj: { [key: string]: T }, func: (key: string, value: T) => void) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                func(key, obj[key]);
            }
        }
    }

    /**
     * Transform an dictionary object to a list of couples (key, value).
     */
    export function items<T>(obj: { [key: string]: T }): [string, T][] {
        let result: [string, T][] = [];
        iteritems(obj, (key, value) => result.push([key, value]));
        return result;
    }

    /**
     * Return the list of keys from an object.
     */
    export function keys<T extends object>(obj: T): (Extract<keyof T, string>)[] {
        var result: (Extract<keyof T, string>)[] = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                result.push(key);
            }
        }
        return result;
    }

    /**
     * Return the list of values from an object.
     */
    export function values<T>(obj: { [key: string]: T }): T[] {
        var result: T[] = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                result.push(obj[key]);
            }
        }
        return result;
    }

    /**
     * Iterate an enum values.
     */
    export function iterenum<T>(obj: T, callback: (item: number) => void) {
        for (var val in obj) {
            var parsed = parseInt(val, 10);
            if (!isNaN(parsed)) {
                callback(parsed);
            }
        }
    }

    /**
     * Create a dictionary from a list of couples
     */
    export function dict<T>(array: [string, T][]): { [index: string]: T } {
        let result: { [index: string]: T } = {};
        array.forEach(([key, value]) => result[key] = value);
        return result;
    }

    /**
     * Create a dictionnary index from a list of objects
     */
    export function index<T>(array: T[], keyfunc: (obj: T) => string): { [key: string]: T } {
        var result: { [key: string]: T } = {};
        array.forEach(obj => result[keyfunc(obj)] = obj);
        return result;
    }

    /**
     * Add an item to the end of a list, only if not already there
     */
    export function add<T>(array: T[], item: T): boolean {
        if (!contains(array, item)) {
            array.push(item);
            return true;
        } else {
            return false;
        }
    }
    /**
     * Remove an item from a list if found. Return true if changed.
     */
    export function remove<T>(array: T[], item: T): boolean {
        var idx = array.indexOf(item);
        if (idx >= 0) {
            array.splice(idx, 1);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check if two standard objects are equal.
     */
    export function equals<T>(obj1: { [key: string]: T }, obj2: { [key: string]: T }): boolean {
        return JSON.stringify(obj1) == JSON.stringify(obj2);
    }

    /**
     * Call a function on any couple formed from combining two arrays.
     */
    export function combicall<T>(array1: T[], array2: T[], callback: (item1: T, item2: T) => void): void {
        array1.forEach(item1 => array2.forEach(item2 => callback(item1, item2)));
    }

    /**
     * Combinate two filter functions (predicates), with a boolean and.
     */
    export function andfilter<T>(filt1: (item: T) => boolean, filt2: (item: T) => boolean): (item: T) => boolean {
        return (item: T) => filt1(item) && filt2(item);
    }

    /**
     * Get the class name of an object.
     */
    export function classname(obj: Object): string {
        return (<any>obj.constructor).name;
    }

    /**
     * Get the lowest item of an array, using a mapping function.
     */
    export function lowest<T>(array: T[], rating: (item: T) => number): T {
        var rated = array.map((item: T): [T, number] => [item, rating(item)]);
        rated.sort((a, b) => cmp(a[1], b[1]));
        return rated[0][0];
    }

    /**
     * Return a function bound to an object.
     * 
     * This is useful to pass the bound function as callback directly.
     */
    export function bound<T, K extends keyof T>(obj: T, func: K): T[K] {
        let attr = obj[func];
        if (attr instanceof Function) {
            return attr.bind(obj);
        } else {
            return <any>(() => attr);
        }
    }

    /**
     * Return a 0.0-1.0 factor of progress between two limits.
     */
    export function progress(value: number, min: number, max: number) {
        var result = (value - min) / (max - min);
        return clamp(result, 0.0, 1.0);
    }

    /**
     * Copy all fields of an object in another (shallow copy)
     */
    export function copyfields<T>(src: Partial<T>, dest: Partial<T>) {
        for (let key in src) {
            if (src.hasOwnProperty(key)) {
                dest[key] = src[key];
            }
        }
    }

    /**
     * Copy an object (only a shallow copy of immediate properties)
     */
    export function copy<T>(object: T): T {
        let objectCopy = <T>Object.create(object.constructor.prototype);
        copyfields(object, objectCopy);
        return objectCopy;
    }

    /**
     * Merge an object into another
     */
    export function merge<T>(base: T, incoming: Partial<T>): T {
        let result = copy(base);
        copyfields(incoming, result);
        return result;
    }

    export const STOP_CRAWLING = {};

    /**
     * Recursively crawl through an object, yielding any defined value found along the way
     * 
     * If *replace* is set to true, the current object is replaced (in array or object attribute) by the result of the callback
     * 
     * *memo* is used to prevent circular references to be traversed
     */
    export function crawl(obj: any, callback: (item: any) => any, replace = false, memo: any[] = []) {
        if (obj instanceof Object && !Array.isArray(obj)) {
            if (memo.indexOf(obj) >= 0) {
                return obj;
            } else {
                memo.push(obj);
            }
        }

        if (obj !== undefined && obj !== null && typeof obj != "function") {
            let result = callback(obj);

            if (result === STOP_CRAWLING) {
                return;
            }

            if (Array.isArray(obj)) {
                let subresult = obj.map(value => crawl(value, callback, replace, memo));
                if (replace) {
                    subresult.forEach((value, index) => {
                        obj[index] = value;
                    });
                }
            } else if (obj instanceof Object) {
                let subresult: any = {};
                iteritems(obj, (key, value) => {
                    subresult[key] = crawl(value, callback, replace, memo);
                });
                if (replace) {
                    copyfields(subresult, obj);
                }
            }

            return result;
        } else {
            return obj;
        }
    }

    /**
     * Return the minimal value of an array
     */
    export function min<T>(array: T[]): T {
        return array.reduce((a, b) => a < b ? a : b);
    }

    /**
     * Return the maximal value of an array
     */
    export function max<T>(array: T[]): T {
        return array.reduce((a, b) => a > b ? a : b);
    }

    /**
     * Return the sum of an array
     */
    export function sum(array: number[]): number {
        return array.reduce((a, b) => a + b, 0);
    }

    /**
     * Return the average of an array
     */
    export function avg(array: number[]): number {
        return sum(array) / array.length;
    }

    /**
     * Return value, with the same sign as base
     */
    export function samesign(value: number, base: number): number {
        return Math.abs(value) * (base < 0 ? -1 : 1);
    }

    /**
     * Return a copy of the array, sorted by a cmp function (equivalent of javascript sort)
     */
    export function sorted<T>(array: T[], cmpfunc: (v1: T, v2: T) => number): T[] {
        return acopy(array).sort(cmpfunc);
    }

    /**
     * Return a copy of the array, sorted by the result of a function applied to each item
     */
    export function sortedBy<T1, T2>(array: T1[], func: (val: T1) => T2, reverse = false): T1[] {
        return sorted(array, (a, b) => cmp(func(a), func(b), reverse));
    }

    /**
     * Return the minimum of an array transformed by a function
     */
    export function minBy<T1, T2>(array: T1[], func: (val: T1) => T2): T1 {
        return array.reduce((a, b) => func(a) < func(b) ? a : b);
    }

    /**
     * Return the maximum of an array transformed by a function
     */
    export function maxBy<T1, T2>(array: T1[], func: (val: T1) => T2): T1 {
        return array.reduce((a, b) => func(a) > func(b) ? a : b);
    }

    /**
     * Return a copy of an array, containing each value only once
     */
    export function unique<T>(array: T[]): T[] {
        return array.filter((value, index, self) => self.indexOf(value) === index);
    }

    /**
     * Return the union of two arrays (items in either array)
     */
    export function union<T>(array1: T[], array2: T[]): T[] {
        return array1.concat(difference(array2, array1));
    }

    /**
     * Return the difference between two arrays (items in the first, but not in the second)
     */
    export function difference<T>(array1: T[], array2: T[]): T[] {
        return array1.filter(value => !contains(array2, value));
    }

    /**
     * Return the intersection of two arrays (items in both arrays)
     */
    export function intersection<T>(array1: T[], array2: T[]): T[] {
        return array1.filter(value => contains(array2, value));
    }

    /**
     * Return the disjunctive union of two arrays (items not in both arrays)
     */
    export function disjunctunion<T>(array1: T[], array2: T[]): T[] {
        return difference(union(array1, array2), intersection(array1, array2));
    }
}

module TK {
    testing("Iterators", test => {
        function checkit<T>(base_iterator: Iterator<T>, ...values: (T | null)[]) {
            let iterator = base_iterator;
            values.forEach(value => {
                let [head, tail] = iterator();
                test.check.equals(head, value);
                iterator = tail;
            });

            // second iteration to check for repeatability
            iterator = base_iterator;
            values.forEach(value => {
                let [head, tail] = iterator();
                test.check.equals(head, value);
                iterator = tail;
            });
        }

        function checkarray<T>(iterator: Iterator<T>, values: T[]) {
            test.check.equals(imaterialize(iterator), values);

            // second iteration to check for repeatability
            test.check.equals(imaterialize(iterator), values);
        }

        test.case("calls a function for each yielded value", check => {
            let iterator = iarray([1, 2, 3]);
            let result: number[] = [];
            iforeach(iterator, bound(result, "push"));
            check.equals(result, [1, 2, 3]);

            result = [];
            iforeach(iterator, i => {
                result.push(i);
                if (i == 2) {
                    return null;
                } else {
                    return undefined;
                }
            });
            check.equals(result, [1, 2]);

            result = [];
            iforeach(iterator, i => {
                result.push(i);
                return i;
            }, 2);
            check.equals(result, [1, 2]);
        });

        test.case("creates an iterator from an array", check => {
            checkit(iarray([]), null, null, null);
            checkit(iarray([1, 2, 3]), 1, 2, 3, null, null, null);
        });

        test.case("creates an iterator from a single value", check => {
            checkarray(isingle(1), [1]);
            checkarray(isingle("a"), ["a"]);
        });

        test.case("finds the first item passing a predicate", check => {
            check.equals(ifirst(iarray(<number[]>[]), i => i % 2 == 0), null);
            check.equals(ifirst(iarray([1, 2, 3]), i => i % 2 == 0), 2);
            check.equals(ifirst(iarray([1, 3, 5]), i => i % 2 == 0), null);
        });

        test.case("finds the first item mapping to a value", check => {
            let predicate = (i: number) => i % 2 == 0 ? (i * 4).toString() : null
            check.equals(ifirstmap(iarray([]), predicate), null);
            check.equals(ifirstmap(iarray([1, 2, 3]), predicate), "8");
            check.equals(ifirstmap(iarray([1, 3, 5]), predicate), null);
        });

        test.case("materializes an array from an iterator", check => {
            check.equals(imaterialize(iarray([1, 2, 3])), [1, 2, 3]);

            check.throw(() => imaterialize(iarray([1, 2, 3, 4, 5]), 2), "Length limit on iterator materialize");
        });

        test.case("creates an iterator in a range of integers", check => {
            checkarray(irange(4), [0, 1, 2, 3]);
            checkarray(irange(4, 1), [1, 2, 3, 4]);
            checkarray(irange(5, 3, 2), [3, 5, 7, 9, 11]);
            checkit(irange(), 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
        });

        test.case("uses a step iterator to scan numbers", check => {
            checkit(istep(), 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
            checkit(istep(3), 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);
            checkarray(istep(3, irepeat(1, 4)), [3, 4, 5, 6, 7]);
            checkarray(istep(8, IEMPTY), [8]);
            checkit(istep(1, irange()), 1, 1, 2, 4, 7, 11, 16);
        });

        test.case("skips a number of values", check => {
            checkarray(iskip(irange(7), 3), [3, 4, 5, 6]);
            checkarray(iskip(irange(7), 12), []);
            checkarray(iskip(IEMPTY, 3), []);
        });

        test.case("gets a value at an iterator position", check => {
            check.equals(iat(irange(), -1), null);
            check.equals(iat(irange(), 0), 0);
            check.equals(iat(irange(), 8), 8);
            check.equals(iat(irange(5), 8), null);
            check.equals(iat(IEMPTY, 0), null);
        });

        test.case("chains iterators", check => {
            checkarray(ichain(), []);
            checkarray(ichain(irange(3)), [0, 1, 2]);
            checkarray(ichain(iarray([1, 2]), iarray([]), iarray([3, 4, 5])), [1, 2, 3, 4, 5]);
        });

        test.case("chains iterator of iterators", check => {
            checkarray(ichainit(IEMPTY), []);
            checkarray(ichainit(iarray([iarray([1, 2, 3]), iarray([]), iarray([4, 5])])), [1, 2, 3, 4, 5]);
        });

        test.case("repeats a value", check => {
            checkit(irepeat("a"), "a", "a", "a", "a");
            checkarray(irepeat("a", 3), ["a", "a", "a"]);
        });

        test.case("loops an iterator", check => {
            checkarray(iloop(irange(3), 2), [0, 1, 2, 0, 1, 2]);
            checkit(iloop(irange(1)), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

            let onloop = check.mockfunc("onloop");
            let iterator = iloop(irange(2), 3, onloop.func);
            function next() {
                let value;
                [value, iterator] = iterator();
                return value;
            }
            check.equals(next(), 0);
            check.called(onloop, 0);
            check.equals(next(), 1);
            check.called(onloop, 0);
            check.equals(next(), 0);
            check.called(onloop, 1);
            check.equals(next(), 1);
            check.called(onloop, 0);
            check.equals(next(), 0);
            check.called(onloop, 1);
            check.equals(next(), 1);
            check.called(onloop, 0);
            check.equals(next(), null);
            check.called(onloop, 0);
        });

        test.case("maps an iterator", check => {
            checkarray(imap(IEMPTY, i => i * 2), []);
            checkarray(imap(irange(3), i => i * 2), [0, 2, 4]);
        });

        test.case("filters an iterator", check => {
            checkarray(imap(IEMPTY, i => i % 3 == 0), []);
            checkarray(ifilter(irange(12), i => i % 3 == 0), [0, 3, 6, 9]);
        });

        test.case("combines iterators", check => {
            let iterator = icombine(iarray([1, 2, 3]), iarray(["a", "b"]));
            checkarray(iterator, [[1, "a"], [1, "b"], [2, "a"], [2, "b"], [3, "a"], [3, "b"]]);
        });

        test.case("zips iterators", check => {
            checkarray(izip(IEMPTY, IEMPTY), []);
            checkarray(izip(iarray([1, 2, 3]), iarray(["a", "b"])), [[1, "a"], [2, "b"]]);

            checkarray(izipg(IEMPTY, IEMPTY), []);
            checkarray(izipg(iarray([1, 2, 3]), iarray(["a", "b"])), <[number | null, string | null][]>[[1, "a"], [2, "b"], [3, null]]);
        });

        test.case("partitions iterators", check => {
            let [it1, it2] = ipartition(IEMPTY, () => true);
            checkarray(it1, []);
            checkarray(it2, []);

            [it1, it2] = ipartition(irange(5), i => i % 2 == 0);
            checkarray(it1, [0, 2, 4]);
            checkarray(it2, [1, 3]);
        });

        test.case("returns unique items", check => {
            checkarray(iunique(IEMPTY), []);
            checkarray(iunique(iarray([5, 3, 2, 3, 4, 5])), [5, 3, 2, 4]);
            checkarray(iunique(iarray([5, 3, 2, 3, 4, 5]), 4), [5, 3, 2, 4]);
            check.throw(() => imaterialize(iunique(iarray([5, 3, 2, 3, 4, 5]), 3)), "Unique count limit on iterator");
        });

        test.case("uses ireduce for some common functions", check => {
            check.equals(isum(IEMPTY), 0);
            check.equals(isum(irange(4)), 6);

            check.equals(icat(IEMPTY), "");
            check.equals(icat(iarray(["a", "bc", "d"])), "abcd");

            check.equals(imin(IEMPTY), Infinity);
            check.equals(imin(iarray([3, 8, 2, 4])), 2);

            check.equals(imax(IEMPTY), -Infinity);
            check.equals(imax(iarray([3, 8, 2, 4])), 8);
        });
    });
}
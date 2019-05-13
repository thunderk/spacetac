module TK {
    testing("Iterators", test => {
        function checkit<T>(check: TestContext, base_iterator: Iterable<T>, values: T[], infinite = false) {
            function checker(check: TestContext) {
                let iterator = base_iterator[Symbol.iterator]();
                values.forEach((value, idx) => {
                    let state = iterator.next();
                    check.equals(state.done, false, `index ${idx} not done`);
                    check.equals(state.value, value, `index ${idx} value`);
                });
                if (!infinite) {
                    range(3).forEach(oidx => {
                        let state = iterator.next();
                        check.equals(state.done, true, `index ${values.length + oidx} done`);
                    });
                }
            }

            check.in("first iteration", checker);
            check.in("second iteration", checker);
        }

        test.case("constructs an iterator from a recurrent formula", check => {
            checkit(check, irecur(1, x => x + 2), [1, 3, 5], true);
            checkit(check, irecur(4, x => x ? x - 1 : null), [4, 3, 2, 1, 0]);
        });

        test.case("constructs an iterator from an array", check => {
            checkit(check, iarray([]), []);
            checkit(check, iarray([1, 2, 3]), [1, 2, 3]);
        });

        test.case("constructs an iterator from a single value", check => {
            checkit(check, isingle(1), [1]);
            checkit(check, isingle("a"), ["a"]);
        });

        test.case("repeats a value", check => {
            checkit(check, irepeat("a"), ["a", "a", "a", "a"], true);
            checkit(check, irepeat("a", 3), ["a", "a", "a"]);
        });

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
            checkit(check, irange(4), [0, 1, 2, 3]);
            checkit(check, irange(4, 1), [1, 2, 3, 4]);
            checkit(check, irange(5, 3, 2), [3, 5, 7, 9, 11]);
            checkit(check, irange(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], true);
        });

        test.case("uses a step iterator to scan numbers", check => {
            checkit(check, istep(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], true);
            checkit(check, istep(3), [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], true);
            checkit(check, istep(3, irepeat(1, 4)), [3, 4, 5, 6, 7]);
            checkit(check, istep(8, IEMPTY), [8]);
            checkit(check, istep(1, irange()), [1, 1, 2, 4, 7, 11, 16], true);
        });

        test.case("skips a number of values", check => {
            checkit(check, iskip(irange(7), 3), [3, 4, 5, 6]);
            checkit(check, iskip(irange(7), 12), []);
            checkit(check, iskip(IEMPTY, 3), []);
        });

        test.case("gets a value at an iterator position", check => {
            check.equals(iat(irange(), -1), null);
            check.equals(iat(irange(), 0), 0);
            check.equals(iat(irange(), 8), 8);
            check.equals(iat(irange(5), 8), null);
            check.equals(iat(IEMPTY, 0), null);
        });

        test.case("chains iterator of iterators", check => {
            checkit(check, ichainit(IEMPTY), []);
            checkit(check, ichainit(iarray([iarray([1, 2, 3]), iarray([]), iarray([4, 5])])), [1, 2, 3, 4, 5]);
        });

        test.case("chains iterators", check => {
            checkit(check, ichain(), []);
            checkit(check, ichain(irange(3)), [0, 1, 2]);
            checkit(check, ichain(iarray([1, 2]), iarray([]), iarray([3, 4, 5])), [1, 2, 3, 4, 5]);
        });

        test.case("loops an iterator", check => {
            checkit(check, iloop(irange(3), 2), [0, 1, 2, 0, 1, 2]);
            checkit(check, iloop(irange(1)), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], true);

            let onloop = check.mockfunc("onloop");
            let iterator = iloop(irange(2), 3, onloop.func)[Symbol.iterator]();
            check.in("idx 0", check => {
                check.equals(iterator.next().value, 0);
                check.called(onloop, 0);
            });
            check.in("idx 1", check => {
                check.equals(iterator.next().value, 1);
                check.called(onloop, 0);
            });
            check.in("idx 2", check => {
                check.equals(iterator.next().value, 0);
                check.called(onloop, 1);
            });
            check.in("idx 3", check => {
                check.equals(iterator.next().value, 1);
                check.called(onloop, 0);
            });
            check.in("idx 4", check => {
                check.equals(iterator.next().value, 0);
                check.called(onloop, 1);
            });
            check.in("idx 5", check => {
                check.equals(iterator.next().value, 1);
                check.called(onloop, 0);
            });
            check.in("idx 6", check => {
                check.equals(iterator.next().value, undefined);
                check.called(onloop, 0);
            });
        });

        test.case("maps an iterator", check => {
            checkit(check, imap(IEMPTY, i => i * 2), []);
            checkit(check, imap(irange(3), i => i * 2), [0, 2, 4]);
        });

        test.case("reduces an iterator", check => {
            check.equals(ireduce(IEMPTY, (a, b) => a + b, 2), 2);
            check.equals(ireduce([9], (a, b) => a + b, 2), 11);
            check.equals(ireduce([9, 1], (a, b) => a + b, 2), 12);
        });

        test.case("filters an iterator with a predicate", check => {
            checkit(check, imap(IEMPTY, i => i % 3 == 0), []);
            checkit(check, ifilter(irange(12), i => i % 3 == 0), [0, 3, 6, 9]);
        });

        test.case("filters an iterator with a type guard", check => {
            let result = ifiltertype(<(number | string)[]>[1, "a", 2, "b"], (x): x is number => typeof x == "number");
            checkit(check, result, [1, 2]);
        });

        test.case("filters an iterator with a class type", check => {
            let o1 = new RObject();
            let o2 = new RObject();
            let o3 = new RObjectContainer();
            let result = ifilterclass([1, "a", o1, 2, o2, o3, "b"], RObject);
            checkit(check, result, [o1, o2]);
        });

        test.case("combines iterators", check => {
            let iterator = icombine(iarray([1, 2, 3]), iarray(["a", "b"]));
            checkit(check, iterator, [[1, "a"], [1, "b"], [2, "a"], [2, "b"], [3, "a"], [3, "b"]]);
        });

        test.case("zips iterators", check => {
            checkit(check, izip(IEMPTY, IEMPTY), []);
            checkit(check, izip(iarray([1, 2, 3]), iarray(["a", "b"])), [[1, "a"], [2, "b"]]);

            checkit(check, izipg(IEMPTY, IEMPTY), []);
            checkit(check, izipg(iarray([1, 2, 3]), iarray(["a", "b"])), <[number | undefined, string | undefined][]>[[1, "a"], [2, "b"], [3, undefined]]);
        });

        test.case("partitions iterators", check => {
            let [it1, it2] = ipartition(IEMPTY, () => true);
            checkit(check, it1, []);
            checkit(check, it2, []);

            [it1, it2] = ipartition(irange(5), i => i % 2 == 0);
            checkit(check, it1, [0, 2, 4]);
            checkit(check, it2, [1, 3]);
        });

        test.case("alternatively pick from several iterables", check => {
            checkit(check, ialternate([]), []);
            checkit(check, ialternate([[1, 2, 3, 4], [], iarray([5, 6]), IEMPTY, iarray([7, 8, 9])]), [1, 5, 7, 2, 6, 8, 3, 9, 4]);
        });

        test.case("returns unique items", check => {
            checkit(check, iunique(IEMPTY), []);
            checkit(check, iunique(iarray([5, 3, 2, 3, 4, 5])), [5, 3, 2, 4]);
            checkit(check, iunique(iarray([5, 3, 2, 3, 4, 5]), 4), [5, 3, 2, 4]);
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
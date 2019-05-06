module TK.Specs {
    testing("Tools", test => {
        test.case("returns boolean equivalent", check => {
            check.same(bool(null), false, "null");
            check.same(bool(undefined), false, "undefined");

            check.same(bool(false), false, "false");
            check.same(bool(true), true, "true");

            check.same(bool(0), false, "0");
            check.same(bool(1), true, "1");
            check.same(bool(-1), true, "-1");

            check.same(bool(""), false, "\"\"");
            check.same(bool(" "), true, "\" \"");
            check.same(bool("abc"), true, "\"abc\"");

            check.same(bool([]), false, "[]");
            check.same(bool([1]), true, "[1]");
            check.same(bool([null, "a"]), true, "[null, \"a\"]");

            check.same(bool({}), false, "{}");
            check.same(bool({ a: 5 }), true, "{a: 5}");
            check.same(bool(new Timer()), true, "new Timer()");
        });

        test.case("coalesces to a default value", check => {
            check.equals(coalesce(0, 2), 0);
            check.equals(coalesce(5, 2), 5);
            check.equals(coalesce(null, 2), 2);
            check.equals(coalesce(undefined, 2), 2);

            check.equals(coalesce("", "a"), "");
            check.equals(coalesce("b", "a"), "b");
            check.equals(coalesce(null, "a"), "a");
            check.equals(coalesce(undefined, "a"), "a");
        });

        test.case("do basic function composition", check => {
            check.equals(fmap((x: number) => x * 2, x => x + 1)(3), 8);
        });

        test.case("function composes a fallback value for null results", check => {
            let f = nnf(-1, x => x > 3 ? null : x);
            check.equals(f(2), 2);
            check.equals(f(3), 3);
            check.equals(f(4), -1);
        });

        test.case("checks for null value", check => {
            let value: number | null = 5;
            check.equals(nn(value), 5);
            value = 0;
            check.equals(nn(value), 0);
            value = null;
            check.throw(() => nn(value), "Null value");
        });

        test.case("removes null values from arrays", check => {
            let value: (number | null)[] = [];
            check.equals(nna(value), []);
            value = [1, 2];
            check.equals(nna(value), [1, 2]);
            value = [1, null, 3];
            check.equals(nna(value), [1, 3]);
        });

        test.case("cast-checks objects", check => {
            let obj = new RObject();
            check.equals(as(RObject, obj), obj);
            check.throw(() => as(Timer, obj), new Error("Bad cast"));
        });

        test.case("compare values", check => {
            check.equals(cmp(8, 5), 1);
            check.same(cmp(5, 8), -1);
            check.equals(cmp(5, 5), 0);

            check.equals(cmp("c", "b"), 1);
            check.same(cmp("b", "c"), -1);
            check.equals(cmp("b", "b"), 0);

            check.same(cmp(8, 5, true), -1);
            check.equals(cmp(5, 8, true), 1);
            check.equals(cmp(5, 5, true), 0);
        });

        test.case("clamp values in a range", check => {
            check.equals(clamp(5, 3, 8), 5);
            check.equals(clamp(1, 3, 8), 3);
            check.equals(clamp(10, 3, 8), 8);
        });

        test.case("interpolates values linearly", check => {
            check.equals(lerp(0, 0, 4), 0);
            check.equals(lerp(0.5, 0, 4), 2);
            check.equals(lerp(1, 0, 4), 4);
            check.equals(lerp(2, 0, 4), 8);
            check.same(lerp(-1, 0, 4), -4);
            check.equals(lerp(0.5, 3, 4), 3.5);
            check.equals(lerp(0.5, 3, 3), 3);
            check.equals(lerp(0.5, 3, 2), 2.5);
        });

        test.case("duplicates objects", check => {
            check.equals(duplicate(null), null);
            check.equals(duplicate(5), 5);
            check.equals(duplicate("test"), "test");
            check.equals(duplicate({ a: 4 }), { a: 4 });
            check.equals(duplicate([1, "test"]), [1, "test"]);
            check.equals(duplicate(new TestSerializerObj1(6), <any>TK.Specs), new TestSerializerObj1(6));
            let original = new TestRObject(4);
            check.equals(duplicate(original, <any>TK.Specs), original);
            check.notsame(duplicate(original, <any>TK.Specs), original);
        });

        test.case("copies arrays", check => {
            var array = [1, 2, "test", null, { "a": 5 }];
            var copied = acopy(array);

            check.equals(copied, array);
            check.notsame(copied, array);
            check.same(copied[4], array[4]);

            check.equals(array[2], "test");
            check.equals(copied[2], "test");
            array[2] = "notest";
            check.equals(array[2], "notest");
            check.equals(copied[2], "test");
            copied[2] = "ok";
            check.equals(array[2], "notest");
            check.equals(copied[2], "ok");

            check.equals(array.length, 5);
            check.equals(copied.length, 5);
            remove(copied, 2);
            check.equals(array.length, 5);
            check.equals(copied.length, 4);
        });

        test.case("iterates through sorted arrays", check => {
            var result: number[] = [];
            itersorted([1, 2, 3], item => item, item => result.push(item));
            check.equals(result, [1, 2, 3]);

            result = [];
            itersorted([1, 2, 3], item => -item, item => result.push(item));
            check.equals(result, [3, 2, 1]);
        });

        test.case("checks if an array contains an item", check => {
            check.equals(contains([], 5), false);

            check.equals(contains([3, 5, 8], 5), true);
            check.equals(contains([3, 5, 8], 4), false);

            check.equals(contains([5, 5, 5], 5), true);

            check.equals(contains([3, null, 8], null), true);

            check.equals(contains(["a", "b"], "b"), true);
            check.equals(contains(["a", "b"], "c"), false);
        });

        test.case("capitalizes strings", check => {
            check.equals(capitalize("test"), "Test");
            check.equals(capitalize("test second"), "Test second");
        });

        test.case("produces range of numbers", check => {
            check.equals(range(-1), []);
            check.equals(range(0), []);
            check.equals(range(1), [0]);
            check.equals(range(2), [0, 1]);
            check.equals(range(5), [0, 1, 2, 3, 4]);
        });

        test.case("zips arrays", check => {
            check.equals(zip([], []), []);
            check.equals(zip([], [1]), []);
            check.equals(zip([0], [1]), [[0, 1]]);
            check.equals(zip([0, 2, 4], [1, 3]), [[0, 1], [2, 3]]);
            check.equals(zip([0, 1], ["a", "b"]), [[0, "a"], [1, "b"]]);
        });

        test.case("unzips arrays", check => {
            check.equals(unzip([]), [[], []]);
            check.equals(unzip([[1, "a"]]), [[1], ["a"]]);
            check.equals(unzip([[1, "a"], [2, "b"]]), [[1, 2], ["a", "b"]]);
        });

        test.case("partitions arrays by a predicate", check => {
            check.equals(binpartition([], (i: number) => i % 2 == 0), [[], []]);
            check.equals(binpartition([1, 2, 3, 4], i => i % 2 == 0), [[2, 4], [1, 3]]);
        });

        test.case("produces neighbor tuples from array", check => {
            check.equals(neighbors([]), []);
            check.equals(neighbors([1]), []);
            check.equals(neighbors([1, 2]), [[1, 2]]);
            check.equals(neighbors([1, 2, 3]), [[1, 2], [2, 3]]);
            check.equals(neighbors([1, 2, 3, 4]), [[1, 2], [2, 3], [3, 4]]);

            check.equals(neighbors([], true), []);
            check.equals(neighbors([1], true), [[1, 1]]);
            check.equals(neighbors([1, 2], true), [[1, 2], [2, 1]]);
            check.equals(neighbors([1, 2, 3], true), [[1, 2], [2, 3], [3, 1]]);
            check.equals(neighbors([1, 2, 3, 4], true), [[1, 2], [2, 3], [3, 4], [4, 1]]);
        });

        test.case("filters list with type guards", check => {
            let result = tfilter(<(number | string)[]>[1, "a", 2, "b"], (x): x is number => typeof x == "number");
            check.equals(result, [1, 2]);

            let o1 = new RObject();
            let o2 = new RObject();
            let o3 = new RObjectContainer();
            check.equals(cfilter([1, "a", o1, 2, o2, o3, "b"], RObject), [o1, o2]);
        });

        test.case("flattens lists of lists", check => {
            check.equals(flatten([]), []);
            check.equals(flatten([[]]), []);
            check.equals(flatten([[], []]), []);
            check.equals(flatten([[1], []]), [1]);
            check.equals(flatten([[], [1]]), [1]);
            check.equals(flatten([[1], [2]]), [1, 2]);
            check.equals(flatten([[1, 2], [3, 4], [], [5]]), [1, 2, 3, 4, 5]);
        });

        test.case("counts items in array", check => {
            check.equals(counter([]), []);
            check.equals(counter(["a"]), [["a", 1]]);
            check.equals(counter(["a", "b"]), [["a", 1], ["b", 1]]);
            check.equals(counter(["a", "b", "a"]), [["a", 2], ["b", 1]]);
        });

        test.case("find the first array item to pass a predicate", check => {
            check.equals(first([1, 2, 3], i => i % 2 == 0), 2);
            check.equals(first([1, 2, 3], i => i % 4 == 0), null);

            check.equals(any([1, 2, 3], i => i % 2 == 0), true);
            check.equals(any([1, 2, 3], i => i % 4 == 0), false);
        });

        test.case("creates a simple iterator over an array", check => {
            let i = iterator([1, 2, 3]);
            check.equals(i(), 1);
            check.equals(i(), 2);
            check.equals(i(), 3);
            check.equals(i(), null);
            check.equals(i(), null);

            i = iterator([]);
            check.equals(i(), null);
            check.equals(i(), null);
        });

        test.case("iterates an object keys and values", check => {
            var obj = {
                "a": 1,
                "c": [2.5],
                "b": null
            };
            check.equals(keys(obj), ["a", "c", "b"]);
            check.equals(values(obj), [1, [2.5], null]);
            var result: { [key: string]: any } = {};
            iteritems(obj, (key, value) => { result[key] = value; });
            check.equals(result, obj);

            check.equals(dict(items(obj)), obj);
        });

        test.case("iterates an enum", check => {
            enum Test {
                ZERO,
                ONE,
                TWO
            };

            var result: any[] = [];
            iterenum(Test, item => result.push(item));
            check.equals(result, [0, 1, 2]);
        });

        test.case("create a dict from an array of couples", check => {
            check.equals(dict([]), {});
            check.equals(dict([["5", 3], ["4", 1], ["5", 8]]), { "5": 8, "4": 1 });
        });

        test.case("create an index from an array", check => {
            check.equals(index([2, 3, 4], i => (i - 1).toString()), { "1": 2, "2": 3, "3": 4 });
        });

        test.case("add an item in an array", check => {
            var result;
            var array = [1];

            result = add(array, 8);
            check.equals(array, [1, 8]);
            check.equals(result, true);

            result = add(array, 2);
            check.equals(array, [1, 8, 2]);
            check.equals(result, true);

            result = add(array, 8);
            check.equals(array, [1, 8, 2]);
            check.equals(result, false);
        });

        test.case("removes an item from an array", check => {
            var array = [1, 2, 3];
            var result = remove(array, 1);
            check.equals(array, [2, 3]);
            check.equals(result, true);
            result = remove(array, 1);
            check.equals(array, [2, 3]);
            check.equals(result, false);
            result = remove(array, 2);
            check.equals(array, [3]);
            check.equals(result, true);
            result = remove(array, 3);
            check.equals(array, []);
            check.equals(result, true);
            result = remove(array, 3);
            check.equals(array, []);
            check.equals(result, false);
        });

        test.case("checks objects equality", check => {
            check.equals(equals({}, {}), true);
            check.equals(equals({ "a": 1 }, { "a": 1 }), true);
            check.equals(equals({ "a": 1 }, { "a": 2 }), false);
            check.equals(equals({ "a": 1 }, { "b": 1 }), false);
            check.equals(equals({ "a": 1 }, { "a": null }), false);
        });

        test.case("combinate filters", check => {
            var filter = andfilter((item: number) => item > 5, (item: number) => item < 12);
            check.equals(filter(4), false);
            check.equals(filter(5), false);
            check.equals(filter(6), true);
            check.equals(filter(8), true);
            check.equals(filter(11), true);
            check.equals(filter(12), false);
            check.equals(filter(13), false);
        });

        test.case("get a class name", check => {
            class Test {
            }
            var a = new Test();
            check.equals(classname(a), "Test");
        });

        test.case("find lowest item of an array", check => {
            check.equals(lowest(["aaa", "b", "cc"], s => s.length), "b");
        });

        test.case("binds callbacks", check => {
            class Test {
                prop = 5;
                meth() {
                    return this.prop + 1;
                }
            }
            var inst = new Test();
            var double = (getter: () => number): number => getter() * 2;
            check.throw(() => double(inst.meth));
            check.equals(double(bound(inst, "meth")), 12);
        });

        test.case("computes progress between two boundaries", check => {
            check.equals(progress(-1.0, 0.0, 1.0), 0.0);
            check.equals(progress(0.0, 0.0, 1.0), 0.0);
            check.equals(progress(0.4, 0.0, 1.0), 0.4);
            check.equals(progress(1.8, 0.0, 1.0), 1.0);
            check.equals(progress(1.5, 0.5, 2.5), 0.5);
        });

        test.case("copies full javascript objects", check => {
            class TestObj {
                a: string;
                b: any;
                constructor() {
                    this.a = "test";
                    this.b = { c: 5.1, d: ["unit", "test", 5] };
                }
                get(): string {
                    return this.a;
                }
            }

            var ini = new TestObj();

            var cop = copy(ini);

            check.notsame(cop, ini);
            check.equals(cop, ini);

            check.equals(cop.get(), "test");
        });

        test.case("merges objects", check => {
            check.equals(merge({}, {}), {});
            check.equals(merge(<any>{ a: 1 }, { b: 2 }), { a: 1, b: 2 });
            check.equals(merge(<any>{ a: 1 }, { a: 3, b: 2 }), { a: 3, b: 2 });
            check.equals(merge(<any>{ a: 1, b: 2 }, { a: undefined }), { a: undefined, b: 2 });
        });

        test.case("crawls through objects", check => {
            var obj = {
                "a": 1,
                "b": "test",
                "c": {
                    "a": <any[]>[2, "thing", { "a": 3, "b": {} }],
                    "b": null,
                    "c": undefined,
                    "d": false
                }
            };
            /*(<any>obj).jasmineToString = () => "obj1";
            (<any>obj.c).jasmineToString = () => "obj2";
            (<any>obj.c.a[2]).jasmineToString = () => "obj3";
            (<any>obj.c.a[2].b).jasmineToString = () => "obj4";
            (<any>obj.c.a).jasmineToString = () => "array1";*/

            var crawled: any[] = [];
            crawl(obj, val => crawled.push(val));
            check.equals(crawled, [obj, 1, "test", obj.c, obj.c.a, 2, "thing", obj.c.a[2], 3, obj.c.a[2].b, false]);
            check.equals(obj.a, 1);

            // replace mode
            crawl(obj, val => typeof val == "number" ? 5 : val, true);
            check.equals(obj, { a: 5, b: "test", c: { a: [5, "thing", { a: 5, b: {} }], b: null, c: undefined, d: false } });
        });

        test.case("get minimal item of an array", check => {
            check.equals(min([5, 1, 8]), 1);
        });

        test.case("get maximal item of an array", check => {
            check.equals(max([5, 12, 8]), 12);
        });

        test.case("get sum of an array", check => {
            check.equals(sum([5, 1, 8]), 14);
        });

        test.case("get average of an array", check => {
            check.equals(avg([4, 2, 9]), 5);
        });

        test.case("converts to same sign", check => {
            check.equals(samesign(2, 1), 2);
            check.equals(samesign(2, -1), -2);
            check.equals(samesign(-2, 1), 2);
            check.equals(samesign(-2, -1), -2);
        });

        test.case("sorts an array", check => {
            let base = ["aa", "bbb", "c", "dddd"];
            check.equals(sorted(base, (a, b) => cmp(a.length, b.length)), ["c", "aa", "bbb", "dddd"]);
            check.equals(base, ["aa", "bbb", "c", "dddd"]);
        });

        test.case("sorts an array, with function applied to each element", check => {
            check.equals(sortedBy([-8, 4, -2, 6], Math.abs), [-2, 4, 6, -8]);
            check.equals(sortedBy([-8, 4, -2, 6], Math.abs, true), [-8, 6, 4, -2]);
        });

        test.case("get minimal item of an array, with function applied to each element", check => {
            check.equals(minBy([-8, 4, -2, 6], Math.abs), -2);
        });

        test.case("get maximal item of an array, with function applied to each element", check => {
            check.equals(maxBy([-8, 4, -2, 6], Math.abs), -8);
        });

        test.case("filter out duplicates in array", check => {
            check.equals(unique([]), []);
            check.equals(unique([1, 2, 3]), [1, 2, 3]);
            check.equals(unique([1, 2, 3, 2, 1]), [1, 2, 3]);
        });

        test.case("get the union between two arrays", check => {
            check.equals(union([], []), []);
            check.equals(union([], [5]), [5]);
            check.equals(union([4], []), [4]);
            check.equals(union([4], [5]), [4, 5]);
            check.equals(union([1, 2, 4, 8], [3, 2, 8, 7]), [1, 2, 4, 8, 3, 7]);
        });

        test.case("get the difference between two arrays", check => {
            check.equals(difference([], []), []);
            check.equals(difference([], [5]), []);
            check.equals(difference([1, 2, 4, 8], [2, 8, 7]), [1, 4]);
        });

        test.case("get the intersection of two arrays", check => {
            check.equals(intersection([], []), []);
            check.equals(intersection([], [5]), []);
            check.equals(intersection([4], []), []);
            check.equals(intersection([6], [7]), []);
            check.equals(intersection([1, 8, 2], [2, 8, 4]), [8, 2]);
        });

        test.case("get the disjunct union of two arrays", check => {
            check.equals(disjunctunion([], []), []);
            check.equals(disjunctunion([], [5]), [5]);
            check.equals(disjunctunion([4], []), [4]);
            check.equals(disjunctunion([6], [7]), [6, 7]);
            check.equals(disjunctunion([1, 8, 2], [2, 8, 4]), [1, 4]);
        });
    });
}

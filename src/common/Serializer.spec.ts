module TK.Specs {
    export class TestSerializerObj1 {
        a: number;
        constructor(a = 0) {
            this.a = a;
        }
    }

    export class TestSerializerObj2 {
        a = () => 1
        b = [(obj: any) => 2]
    }

    export class TestSerializerObj3 {
        a = [1, 2];
        postUnserialize() {
            remove(this.a, 2);
        }
    }

    testing("Serializer", test => {
        function checkReversability(obj: any, namespace = TK.Specs): any {
            var serializer = new Serializer(TK.Specs);
            var data = serializer.serialize(obj);
            serializer = new Serializer(TK.Specs);
            var loaded = serializer.unserialize(data);
            test.check.equals(loaded, obj);
            return loaded;
        }

        test.case("serializes simple objects", check => {
            var obj = {
                "a": 5,
                "b": null,
                "c": [{ "a": 2 }, "test"]
            };
            checkReversability(obj);
        });

        test.case("restores objects constructed from class", check => {
            var loaded = checkReversability(new TestSerializerObj1(5));
            check.equals(loaded.a, 5);
            check.same(loaded instanceof TestSerializerObj1, true, "not a TestSerializerObj1 instance");
        });

        test.case("stores one version of the same object", check => {
            var a = new TestSerializerObj1(8);
            var b = new TestSerializerObj1(8);
            var c = {
                'r': a,
                's': ["test", a],
                't': a,
                'u': b
            };
            var loaded = checkReversability(c);
            check.same(loaded.t, loaded.r);
            check.same(loaded.s[1], loaded.r);
            check.notsame(loaded.u, loaded.r);
        });

        test.case("handles circular references", check => {
            var a: any = { b: {} };
            a.b.c = a;

            var loaded = checkReversability(a);
        });

        test.case("ignores some classes", check => {
            var serializer = new Serializer(TK.Specs);
            serializer.addIgnoredClass("TestSerializerObj1");

            var data = serializer.serialize({ a: 5, b: new TestSerializerObj1() });
            var loaded = serializer.unserialize(data);

            check.equals(loaded, { a: 5, b: undefined });
        });

        test.case("ignores functions", check => {
            let serializer = new Serializer(TK.Specs);
            let data = serializer.serialize({ obj: new TestSerializerObj2() });
            let loaded = serializer.unserialize(data);

            let expected = <any>new TestSerializerObj2();
            expected.a = undefined;
            expected.b[0] = undefined;
            check.equals(loaded, { obj: expected });
        });

        test.case("calls specific postUnserialize", check => {
            let serializer = new Serializer(TK.Specs);
            let data = serializer.serialize({ obj: new TestSerializerObj3() });
            let loaded = serializer.unserialize(data);

            let expected = new TestSerializerObj3();
            expected.a = [1];
            check.equals(loaded, { obj: expected });
        });

        test.case("finds TS namespace, even from sub-namespace", check => {
            checkReversability(new Timer());
            checkReversability(new RandomGenerator());
        });
    });
}

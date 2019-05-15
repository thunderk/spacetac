module TK.Specs {
    export class TestRObject extends RObject {
        x: number
        constructor(x = RandomGenerator.global.random()) {
            super();
            this.x = x;
        }
    };

    testing("RObject", test => {
        test.setup(function () {
            (<any>RObject)._next_id = 0;
        })

        test.case("gets a sequential id", check => {
            let o1 = new TestRObject();
            check.equals(o1.id, 0);
            let o2 = new TestRObject();
            let o3 = new TestRObject();
            check.equals(o2.id, 1);
            check.equals(o3.id, 2);

            check.equals(rid(o3), 2);
            check.equals(rid(o3.id), 2);
        })

        test.case("checks object identity", check => {
            let o1 = new TestRObject(1);
            let o2 = new TestRObject(1);
            let o3 = duplicate(o1, TK.Specs);

            check.equals(o1.is(o1), true, "o1 is o1");
            check.equals(o1.is(o2), false, "o1 is not o2");
            check.equals(o1.is(o3), true, "o1 is o3");
            check.equals(o1.is(null), false, "o1 is not null");

            check.equals(o2.is(o1), false, "o2 is not o1");
            check.equals(o2.is(o2), true, "o2 is o2");
            check.equals(o2.is(o3), false, "o2 is not o3");
            check.equals(o2.is(null), false, "o2 is not null");

            check.equals(o3.is(o1), true, "o3 is o1");
            check.equals(o3.is(o2), false, "o3 is not o2");
            check.equals(o3.is(o3), true, "o3 is o3");
            check.equals(o3.is(null), false, "o3 is not null");
        })

        test.case("resets global id on unserialize", check => {
            let o1 = new TestRObject();
            check.equals(o1.id, 0);
            let o2 = new TestRObject();
            check.equals(o2.id, 1);

            let serializer = new Serializer(TK.Specs);
            let packed = serializer.serialize({ objs: [o1, o2] });

            (<any>RObject)._next_id = 0;

            check.equals(new TestRObject().id, 0);
            let unpacked = serializer.unserialize(packed);
            check.equals(unpacked, { objs: [o1, o2] });
            check.equals(new TestRObject().id, 2);
            serializer.unserialize(packed);
            check.equals(new TestRObject().id, 3);
        })
    })

    testing("RObjectContainer", test => {
        test.case("stored objects and get them by their id", check => {
            let o1 = new TestRObject();
            let store = new RObjectContainer([o1]);

            let o2 = new TestRObject();
            check.same(store.get(o1.id), o1);
            check.equals(store.get(o2.id), null);

            store.add(o2);
            check.same(store.get(o1.id), o1);
            check.same(store.get(o2.id), o2);
        })

        test.case("lists contained objects", check => {
            let store = new RObjectContainer<TestRObject>();
            let o1 = store.add(new TestRObject());
            let o2 = store.add(new TestRObject());

            check.equals(store.count(), 2, "count=2");

            let objects = store.list();
            check.equals(objects.length, 2, "list length=2");
            check.contains(objects, o1, "list contains o1");
            check.contains(objects, o2, "list contains o2");

            objects = imaterialize(store.iterator());
            check.equals(objects.length, 2, "list length=2");
            check.contains(objects, o1, "list contains o1");
            check.contains(objects, o2, "list contains o2");

            let ids = store.ids();
            check.equals(ids.length, 2, "ids length=2");
            check.contains(ids, o1.id, "list contains o1.id");
            check.contains(ids, o2.id, "list contains o2.id");
        })

        test.case("removes objects", check => {
            let store = new RObjectContainer<TestRObject>();
            let o1 = store.add(new TestRObject());
            let o2 = store.add(new TestRObject());

            check.in("initial", check => {
                check.equals(store.count(), 2, "count=2");
                check.same(store.get(o1.id), o1, "o1 present");
                check.same(store.get(o2.id), o2, "o2 present");
            });

            store.remove(o1);

            check.in("removed o1", check => {
                check.equals(store.count(), 1, "count=1");
                check.same(store.get(o1.id), null, "o1 missing");
                check.same(store.get(o2.id), o2, "o2 present");
            });
        })
    })
}
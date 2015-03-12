/// <reference path="../../definitions/jasmine.d.ts"/>
/// <reference path="../Serializable.ts"/>

module SpaceTac.Game.Specs {
    "use strict";

    export class SerializableTestObj3 extends Serializable {
        a: boolean;
        b: SerializableTestObj1;
    }

    export class SerializableTestObj2 extends Serializable {
        a: string;

        b: SerializableTestObj3;

        constructor(a: string = "test") {
            super();
            this.a = a;
            this.b = null;
        }

        prepend(prefix: string): string {
            return prefix + this.a;
        }
    }

    export class SerializableTestObj1 extends Serializable {
        a: number;

        b: SerializableTestObj2;

        c: SerializableTestObj2[];

        constructor(a: number = 5, b: SerializableTestObj2 = null) {
            super();
            this.a = a;
            this.b = b;
            this.c = [];
        }
    }

    describe("Serializer", () => {
        it("collects serializable classes", () => {
            var serializer = new Serializer();
            var classes = serializer.collectSerializableClasses();

            expect(classes["SpaceTac.Game.Specs.SerializableTestObj1"]).toBe(SerializableTestObj1);
            expect(classes["SpaceTac.Game.Specs.SerializableTestObj2"]).toBe(SerializableTestObj2);
            expect(classes["SpaceTac.Game.Specs.SerializableTestObj3"]).toBe(SerializableTestObj3);
            expect(classes["SpaceTac.Game.Range"]).toBe(Range);
            expect(classes["SpaceTac.Game.Equipments.GatlingGun"]).toBe(Equipments.GatlingGun);
        });

        it("gets an object's full path in namespace", () => {
            var serializer = new Serializer();

            expect(serializer.getClassPath(new SerializableTestObj1())).toBe("SpaceTac.Game.Specs.SerializableTestObj1");
            expect(serializer.getClassPath(new Range(0, 1))).toBe("SpaceTac.Game.Range");
        });

        it("serializes and deserializes simple typescript objects", () => {
            var serializer = new Serializer();
            var obj = new SerializableTestObj2("a string");
            var dumped = serializer.serialize(obj);
            var loaded = serializer.unserialize(dumped);

            expect(loaded).toEqual(obj);
            expect((<SerializableTestObj2>loaded).prepend("this is ")).toEqual("this is a string");
        });

        it("serializes and deserializes nested typescript objects", () => {
            var serializer = new Serializer();
            var obj = new SerializableTestObj1(8, new SerializableTestObj2("test"));
            obj.c.push(new SerializableTestObj2("second test"));
            obj.c.push(new SerializableTestObj2("third test"));

            var dumped = serializer.serialize(obj);
            var loaded = serializer.unserialize(dumped);

            expect(loaded).toEqual(obj);
            expect((<SerializableTestObj1>loaded).b.prepend("this is a ")).toEqual("this is a test");
            expect((<SerializableTestObj1>loaded).c[1].prepend("this is a ")).toEqual("this is a third test");
        });

        it("does not create copies of same object", () => {
            var serializer = new Serializer();
            var obj = new SerializableTestObj1(8, new SerializableTestObj2("test"));
            obj.c.push(obj.b);

            var dumped = serializer.serialize(obj);
            var loaded = serializer.unserialize(dumped);

            expect(loaded).toEqual(obj);
            expect((<SerializableTestObj1>loaded).b).toBe((<SerializableTestObj1>loaded).c[0]);
        });

        it("handles reference cycles", () => {
            var serializer = new Serializer();
            var obj3 = new SerializableTestObj3();
            obj3.a = true;
            var obj2 = new SerializableTestObj2("test");
            var obj1 = new SerializableTestObj1(8, obj2);

            obj3.b = obj1;
            obj2.b = obj3;

            var dumped = serializer.serialize(obj1);
            var loaded = serializer.unserialize(dumped);

            expect(loaded).toEqual(obj1);
            expect((<SerializableTestObj1>loaded).b.b.a).toBe(true);
            expect((<SerializableTestObj1>loaded).b.b.b).toBe(loaded);
        });

        it("resets id sequence between sessions", () => {
            // Start with a fresh ID sequence
            Serializable._next_sid = 0;

            var serializer = new Serializer();

            // Serialize an object
            var obj1 = new SerializableTestObj1(8);
            var dumped = serializer.serialize(obj1);

            // Simulate a page refresh
            Serializable._next_sid = 0;

            // Load dumped object
            var loaded = <SerializableTestObj1>serializer.unserialize(dumped);

            // Add a new object
            loaded.b = new SerializableTestObj2("test");

            // If the ID sequence is not propertly reset, the ID of both objects will clash
            dumped = serializer.serialize(loaded);
            var loaded_again = serializer.unserialize(dumped);
            expect(loaded_again).toEqual(loaded);
        });
    });
}

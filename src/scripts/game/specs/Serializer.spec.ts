/// <reference path="../../definitions/jasmine.d.ts"/>
/// <reference path="../Serializable.ts"/>

module SpaceTac.Game.Specs {
    "use strict";

    export class SerializableTestObj2 extends Serializable {
        a: string;

        constructor(a: string = "test") {
            super();
            this.a = a;
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
            expect(classes["SpaceTac.Game.Range"]).toBe(Range);
            expect(classes["SpaceTac.Game.Equipments.GatlingGun"]).toBe(Equipments.GatlingGun);
        });

        it("gets an object's full path in namespace", () => {
            var serializer = new Serializer();

            expect(serializer.getClassPath(new SerializableTestObj1())).toBe("SpaceTac.Game.Specs.SerializableTestObj1");
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
    });
}

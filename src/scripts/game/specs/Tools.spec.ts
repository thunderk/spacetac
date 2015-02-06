/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game.Specs {
    "use strict";

    class TestObj {
        a: string;
        b: any;

        constructor() {
            this.a = "test";
            this.b = {c: 5.1, d: ["unit", "test", 5]};
        }

        get(): string {
            return this.a;
        }
    }

    describe("Tools", () => {
        it("copies full javascript objects", () => {
            var ini = new TestObj();

            var cop = Tools.copyObject(ini);

            expect(cop).not.toBe(ini);
            expect(cop).toEqual(ini);

            expect(cop.get()).toEqual("test");
        });
    });
}

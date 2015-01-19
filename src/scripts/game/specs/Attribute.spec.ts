/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game {
    "use strict";

    describe("Attribute", function () {
        it("applies minimal and maximal value", function () {
            var attr = new Attribute(AttributeCode.Misc, 100, 50);
            expect(attr.current).toBe(50);

            attr.add(8);
            expect(attr.current).toBe(58);

            attr.add(60);
            expect(attr.current).toBe(100);

            attr.add(-72);
            expect(attr.current).toBe(28);

            attr.add(-60);
            expect(attr.current).toBe(0);

            attr.set(8);
            expect(attr.current).toBe(8);

            attr.set(-4);
            expect(attr.current).toBe(0);

            attr.set(105);
            expect(attr.current).toBe(100);
        });

        it("tells if value changed", function () {
            var result: boolean;
            var attr = new Attribute(AttributeCode.Misc, 100, 50);
            expect(attr.current).toBe(50);

            result = attr.set(51);
            expect(result).toBe(true);

            result = attr.set(51);
            expect(result).toBe(false);

            result = attr.add(1);
            expect(result).toBe(true);

            result = attr.add(0);
            expect(result).toBe(false);

            result = attr.add(1000);
            expect(result).toBe(true);

            result = attr.add(2000);
            expect(result).toBe(false);

            result = attr.set(-500);
            expect(result).toBe(true);

            result = attr.add(-600);
            expect(result).toBe(false);
        });
    });
}

/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game {
    "use strict";

    describe("AttributeCollection", function () {
        it("sets and gets an attribute value", function () {
            var coll = new AttributeCollection();

            coll.setValue(AttributeCode.Initiative, 5);
            expect(coll.getValue(AttributeCode.Initiative)).toBe(5);

            expect(coll.getValue(AttributeCode.Hull)).toBe(0);
            coll.setValue(AttributeCode.Hull, 2);
            expect(coll.getValue(AttributeCode.Hull)).toBe(2);
        });

        it("sets and gets an attribute maximal", function () {
            var coll = new AttributeCollection();

            coll.setMaximum(AttributeCode.Initiative, 5);
            expect(coll.getMaximum(AttributeCode.Initiative)).toBe(5);

            expect(coll.getMaximum(AttributeCode.Hull)).toBe(null);
            coll.setMaximum(AttributeCode.Hull, 2);
            expect(coll.getMaximum(AttributeCode.Hull)).toBe(2);
        });
    });
}

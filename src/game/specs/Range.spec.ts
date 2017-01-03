/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game.Specs {
    "use strict";

    function checkProportional(range: Range, value1: number, value2: number) {
        expect(range.getProportional(value1)).toEqual(value2);
        expect(range.getReverseProportional(value2)).toEqual(value1);
    }

    describe("Range", () => {
        it("can work with proportional values", () => {
            var range = new Range(1, 5);

            checkProportional(range, 0, 1);
            checkProportional(range, 1, 5);
            checkProportional(range, 0.5, 3);
            checkProportional(range, 0.4, 2.6);

            expect(range.getProportional(-0.25)).toEqual(1);
            expect(range.getProportional(1.8)).toEqual(5);

            expect(range.getReverseProportional(0)).toEqual(0);
            expect(range.getReverseProportional(6)).toEqual(1);
        });
    });

    describe("IntegerRange", () => {
        it("can work with proportional values", () => {
            var range = new IntegerRange(1, 5);

            expect(range.getProportional(0)).toEqual(1);
            expect(range.getProportional(0.1)).toEqual(1);
            expect(range.getProportional(0.2)).toEqual(2);
            expect(range.getProportional(0.45)).toEqual(3);
            expect(range.getProportional(0.5)).toEqual(3);
            expect(range.getProportional(0.75)).toEqual(4);
            expect(range.getProportional(0.8)).toEqual(5);
            expect(range.getProportional(0.99)).toEqual(5);
            expect(range.getProportional(1)).toEqual(5);

            expect(range.getReverseProportional(1)).toEqual(0);
            expect(range.getReverseProportional(2)).toEqual(0.2);
            expect(range.getReverseProportional(3)).toEqual(0.4);
            expect(range.getReverseProportional(4)).toEqual(0.6);
            expect(range.getReverseProportional(5)).toEqual(0.8);
        });
    });
}

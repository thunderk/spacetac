module SpaceTac.View.Specs {
    "use strict";

    describe("Tools", () => {
        it("normalizes angles", () => {
            expect(Tools.normalizeAngle(0)).toEqual(0);
            expect(Tools.normalizeAngle(0.1)).toBeCloseTo(0.1, 0.000001);
            expect(Tools.normalizeAngle(Math.PI)).toBeCloseTo(Math.PI, 0.000001);
            expect(Tools.normalizeAngle(Math.PI + 0.5)).toBeCloseTo(-Math.PI + 0.5, 0.000001);
            expect(Tools.normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI, 0.000001);
            expect(Tools.normalizeAngle(-Math.PI - 0.5)).toBeCloseTo(Math.PI - 0.5, 0.000001);
        });
    });
}

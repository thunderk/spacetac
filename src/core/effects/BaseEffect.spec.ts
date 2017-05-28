module TS.SpaceTac.Specs {
    describe("BaseEffect", function () {
        it("gets a fixed or variable amount", function () {
            let effect = new BaseEffect("test");

            expect(effect.resolveAmount(50)).toBe(50);
            expect(effect.resolveAmount({ base: 20, span: 10 }, new SkewedRandomGenerator([0.3]))).toBe(23);
            expect(effect.resolveAmount({ base: 20, span: 0 }, new SkewedRandomGenerator([0.3]))).toBe(20);
        })
    })
}

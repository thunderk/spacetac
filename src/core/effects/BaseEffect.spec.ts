module TK.SpaceTac.Specs {
    testing("BaseEffect", test => {
        test.case("gets a fixed or variable amount", check => {
            let effect = new BaseEffect("test");

            check.equals(effect.resolveAmount(50), 50);
            check.equals(effect.resolveAmount({ base: 20, span: 10 }, new SkewedRandomGenerator([0.3])), 23);
            check.equals(effect.resolveAmount({ base: 20, span: 0 }, new SkewedRandomGenerator([0.3])), 20);
        })
    })
}

module TK.SpaceTac.Specs {
    testing("NameGenerator", test => {
        test.case("generates unique names", check => {
            var random = new SkewedRandomGenerator([0.48, 0.9, 0.1]);
            var gen = new NameGenerator(["a", "b", "c"], random);

            check.equals(gen.getName(), "b");
            check.equals(gen.getName(), "c");
            check.equals(gen.getName(), "a");
            check.equals(gen.getName(), null);
        });
    });
}

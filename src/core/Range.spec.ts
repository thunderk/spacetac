module TK.SpaceTac.Specs {
    testing("Range", test => {
        test.case("can work with proportional values", check => {
            var range = new Range(1, 5);

            function checkProportional(range: Range, value1: number, value2: number) {
                check.equals(range.getProportional(value1), value2);
                check.equals(range.getReverseProportional(value2), value1);
            }

            checkProportional(range, 0, 1);
            checkProportional(range, 1, 5);
            checkProportional(range, 0.5, 3);
            checkProportional(range, 0.4, 2.6);

            check.equals(range.getProportional(-0.25), 1);
            check.equals(range.getProportional(1.8), 5);

            check.equals(range.getReverseProportional(0), 0);
            check.equals(range.getReverseProportional(6), 1);
        });
    });

    testing("IntegerRange", test => {
        test.case("can work with proportional values", check => {
            var range = new IntegerRange(1, 5);

            check.equals(range.getProportional(0), 1);
            check.equals(range.getProportional(0.1), 1);
            check.equals(range.getProportional(0.2), 2);
            check.equals(range.getProportional(0.45), 3);
            check.equals(range.getProportional(0.5), 3);
            check.equals(range.getProportional(0.75), 4);
            check.equals(range.getProportional(0.8), 5);
            check.equals(range.getProportional(0.99), 5);
            check.equals(range.getProportional(1), 5);

            check.equals(range.getReverseProportional(1), 0);
            check.equals(range.getReverseProportional(2), 0.2);
            check.equals(range.getReverseProportional(3), 0.4);
            check.equals(range.getReverseProportional(4), 0.6);
            check.equals(range.getReverseProportional(5), 0.8);
        });
    });
}

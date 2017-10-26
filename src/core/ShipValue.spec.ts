module TK.SpaceTac {
    testing("ShipValue", test => {
        test.case("is initially not limited", check => {
            var attr = new ShipValue("test");

            attr.set(8888888);
            check.equals(attr.get(), 8888888);
        });

        test.case("applies minimal and maximal value", check => {
            var attr = new ShipValue("test", 50, 100);
            check.equals(attr.get(), 50);

            attr.add(8);
            check.equals(attr.get(), 58);

            attr.add(60);
            check.equals(attr.get(), 100);

            attr.add(-72);
            check.equals(attr.get(), 28);

            attr.add(-60);
            check.equals(attr.get(), 0);

            attr.set(8);
            check.equals(attr.get(), 8);

            attr.set(-4);
            check.equals(attr.get(), 0);

            attr.set(105);
            check.equals(attr.get(), 100);

            attr.setMaximal(50);
            check.equals(attr.get(), 50);

            attr.setMaximal(80);
            check.equals(attr.get(), 50);
        });

        test.case("tells the value variation", check => {
            var result: number;
            var attr = new ShipValue("test", 50, 100);
            check.equals(attr.get(), 50);

            result = attr.set(51);
            check.equals(result, 1);

            result = attr.set(51);
            check.equals(result, 0);

            result = attr.add(1);
            check.equals(result, 1);

            result = attr.add(0);
            check.equals(result, 0);

            result = attr.add(1000);
            check.equals(result, 48);

            result = attr.add(2000);
            check.equals(result, 0);

            result = attr.set(-500);
            check.same(result, -100);

            result = attr.add(-600);
            check.equals(result, 0);
        });
    });
}

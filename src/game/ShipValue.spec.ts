module TS.SpaceTac.Game {
    describe("ShipValue", function () {
        it("is initially not limited", function () {
            var attr = new ShipValue("test");

            attr.set(8888888);
            expect(attr.get()).toBe(8888888);
        });

        it("applies minimal and maximal value", function () {
            var attr = new ShipValue("test", 50, 100);
            expect(attr.get()).toBe(50);

            attr.add(8);
            expect(attr.get()).toBe(58);

            attr.add(60);
            expect(attr.get()).toBe(100);

            attr.add(-72);
            expect(attr.get()).toBe(28);

            attr.add(-60);
            expect(attr.get()).toBe(0);

            attr.set(8);
            expect(attr.get()).toBe(8);

            attr.set(-4);
            expect(attr.get()).toBe(0);

            attr.set(105);
            expect(attr.get()).toBe(100);

            attr.setMaximal(50);
            expect(attr.get()).toBe(50);

            attr.setMaximal(80);
            expect(attr.get()).toBe(50);
        });

        it("tells if value changed", function () {
            var result: boolean;
            var attr = new ShipValue("test", 50, 100);
            expect(attr.get()).toBe(50);

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

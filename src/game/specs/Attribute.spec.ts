module SpaceTac.Game {
    "use strict";

    describe("Attribute", function () {
        it("is initially not limited", function () {
            var attr = new Attribute();

            attr.set(8888888);
            expect(attr.current).toBe(8888888);
        });

        it("enumerates codes", function () {
            var result = [];
            Attribute.forEachCode((code: AttributeCode) => {
                result.push(code);
            });
            expect(result).toEqual([
                AttributeCode.Initiative,
                AttributeCode.Hull,
                AttributeCode.Shield,
                AttributeCode.AP,
                AttributeCode.AP_Recovery,
                AttributeCode.AP_Initial,
                AttributeCode.Cap_Material,
                AttributeCode.Cap_Energy,
                AttributeCode.Cap_Electronics,
                AttributeCode.Cap_Human,
                AttributeCode.Cap_Time,
                AttributeCode.Cap_Gravity,
                AttributeCode.Misc
            ]);
        });

        it("applies minimal and maximal value", function () {
            var attr = new Attribute(AttributeCode.Misc, 50, 100);
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

            attr.setMaximal(50);
            expect(attr.current).toBe(50);

            attr.setMaximal(80);
            expect(attr.current).toBe(50);
        });

        it("tells if value changed", function () {
            var result: boolean;
            var attr = new Attribute(AttributeCode.Misc, 50, 100);
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

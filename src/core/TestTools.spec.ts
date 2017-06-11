module TS.SpaceTac.Specs {
    describe("TestTools", () => {
        it("set ship power", () => {
            let ship = new Ship();

            expect(ship.getAttribute("power_capacity")).toBe(0);
            expect(ship.getAttribute("power_generation")).toBe(0);
            expect(ship.getValue("power")).toBe(0);

            TestTools.setShipAP(ship, 12, 4);

            expect(ship.getAttribute("power_capacity")).toBe(12);
            expect(ship.getAttribute("power_generation")).toBe(4);
            expect(ship.getValue("power")).toBe(12);
        });

        it("set ship health", () => {
            let ship = new Ship();

            expect(ship.getAttribute("hull_capacity")).toBe(0);
            expect(ship.getAttribute("shield_capacity")).toBe(0);
            expect(ship.getValue("hull")).toBe(0);
            expect(ship.getValue("shield")).toBe(0);

            TestTools.setShipHP(ship, 100, 200);

            expect(ship.getAttribute("hull_capacity")).toBe(100);
            expect(ship.getAttribute("shield_capacity")).toBe(200);
            expect(ship.getValue("hull")).toBe(100);
            expect(ship.getValue("shield")).toBe(200);
        });
    });
}
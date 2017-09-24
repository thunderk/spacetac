module TK.SpaceTac.Specs {
    describe("ValueTransferEffect", function () {
        it("takes or gives value", function () {
            let ship1 = new Ship();
            TestTools.setShipHP(ship1, 100, 50);
            ship1.setValue("hull", 10);
            let ship2 = new Ship();
            TestTools.setShipHP(ship2, 100, 50);

            let effect = new ValueTransferEffect("hull", -30);
            effect.applyOnShip(ship2, ship1);
            expect(ship1.getValue("hull")).toEqual(40);
            expect(ship2.getValue("hull")).toEqual(70);

            effect = new ValueTransferEffect("hull", 1000);
            effect.applyOnShip(ship2, ship1);
            expect(ship1.getValue("hull")).toEqual(0);
            expect(ship2.getValue("hull")).toEqual(100);
        })

        it("builds a description", function () {
            let effect = new ValueTransferEffect("power", 12);
            expect(effect.getDescription()).toEqual("give 12 power");
            expect(effect.isBeneficial()).toBe(true);

            effect = new ValueTransferEffect("shield", -20);
            expect(effect.getDescription()).toEqual("steal 20 shield");
            expect(effect.isBeneficial()).toBe(false);
        })
    })
}

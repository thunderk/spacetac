module TK.SpaceTac.Specs {
    testing("ValueTransferEffect", test => {
        test.case("takes or gives value", check => {
            let ship1 = new Ship();
            TestTools.setShipHP(ship1, 100, 50);
            ship1.setValue("hull", 10);
            let ship2 = new Ship();
            TestTools.setShipHP(ship2, 100, 50);

            let effect = new ValueTransferEffect("hull", -30);
            effect.applyOnShip(ship2, ship1);
            check.equals(ship1.getValue("hull"), 40);
            check.equals(ship2.getValue("hull"), 70);

            effect = new ValueTransferEffect("hull", 1000);
            effect.applyOnShip(ship2, ship1);
            check.equals(ship1.getValue("hull"), 0);
            check.equals(ship2.getValue("hull"), 100);
        })

        test.case("builds a description", check => {
            let effect = new ValueTransferEffect("power", 12);
            check.equals(effect.getDescription(), "give 12 power");
            check.equals(effect.isBeneficial(), true);

            effect = new ValueTransferEffect("shield", -20);
            check.equals(effect.getDescription(), "steal 20 shield");
            check.equals(effect.isBeneficial(), false);
        })
    })
}

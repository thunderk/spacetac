module TK.SpaceTac.Specs {
    testing("ValueTransferEffect", test => {
        test.case("takes or gives value", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            TestTools.setShipHP(ship1, 100, 50);
            ship1.setValue("hull", 10);
            let ship2 = battle.fleets[0].addShip();
            TestTools.setShipHP(ship2, 100, 50);

            let effect = new ValueTransferEffect("hull", -30);
            battle.applyDiffs(effect.getOnDiffs(ship2, ship1, 1));
            check.equals(ship1.getValue("hull"), 40);
            check.equals(ship2.getValue("hull"), 70);

            effect = new ValueTransferEffect("hull", 1000);
            battle.applyDiffs(effect.getOnDiffs(ship2, ship1, 1));
            check.equals(ship1.getValue("hull"), 0);
            check.equals(ship2.getValue("hull"), 110);  // over limit but will be fixed later
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

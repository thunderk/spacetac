module TK.SpaceTac.UI.Specs {
    testing("ShipTooltip", test => {
        let testgame = setupBattleview(test);

        test.case("fills ship details", check => {
            let tooltip = new ShipTooltip(testgame.view);
            let ship = testgame.view.battle.play_order[2];
            TestTools.setShipModel(ship, 58, 140, 12);
            ship.name = "Fury";
            ship.model = new ShipModel("fake", "Fury");
            check.patch(ship.model, "getDescription", () => "Super ship model !");
            TestTools.addWeapon(ship, 50);
            TestTools.setAttribute(ship, "evasion", 7);
            ship.setValue("hull", 57);
            ship.setValue("shield", 100);
            ship.setValue("power", 9);
            ship.active_effects.add(new AttributeEffect("hull_capacity", 50));
            ship.active_effects.add(new StickyEffect(new AttributeLimitEffect("shield_capacity", 2), 3));
            tooltip.setShip(ship);

            let images = collectImages((<any>tooltip).container);
            let texts = collectTexts((<any>tooltip).container);
            check.contains(images, "ship-fake-portrait");
            check.contains(images, "action-weapon");
            check.equals(texts, [
                "Level 1 Fury", "Plays in 2 turns",
                "57", "max", "58", "100", "max", "140", "7", "9", "max", "12",
                "Weapon", "• hull capacity +50", "• limit shield capacity to 2 for 3 turns",
                "Super ship model !"
            ]);
        });
    });
}

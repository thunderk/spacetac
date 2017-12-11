module TK.SpaceTac.UI.Specs {
    testing("ShipTooltip", test => {
        let testgame = setupBattleview(test);

        test.case("fills ship details", check => {
            let tooltip = new ShipTooltip(testgame.view);
            let ship = testgame.view.battle.play_order[2];
            ship.fleet.player.name = "Phil";
            ship.name = "Fury";
            ship.model = new ShipModel("fake", "Fury");
            ship.listEquipment().forEach(equ => equ.detach());
            TestTools.setShipHP(ship, 58, 140);
            TestTools.setShipAP(ship, 12);
            TestTools.addWeapon(ship, 50);
            TestTools.setAttribute(ship, "precision", 7);
            TestTools.setAttribute(ship, "maneuvrability", 3);
            ship.setValue("hull", 57);
            ship.setValue("shield", 100);
            ship.setValue("power", 9);
            ship.active_effects.add(new AttributeEffect("hull_capacity", 50));
            ship.active_effects.add(new StickyEffect(new DamageModifierEffect(-15), 3));
            ship.active_effects.add(new AttributeLimitEffect("precision", 10));
            tooltip.setShip(ship);

            let images = collectImages((<any>tooltip).container);
            let texts = collectTexts((<any>tooltip).container);
            check.contains(images, "ship-fake-portrait");
            check.contains(images, "equipment-equipment");
            check.equals(texts, [
                "Phil's Level 1 Fury", "Plays in 2 turns",
                "7", "3", "9", "max", "12", "57", "max", "58", "100", "max", "140",
                "Active effects", "• hull capacity +50", "• damage -15% for 3 turns", "• limit precision to 10",
                "Weapons", "equipment Mk1"
            ]);
        });
    });
}

module TK.SpaceTac.UI.Specs {
    testing("ShipTooltip", test => {
        let testgame = setupBattleview(test);

        test.case("fills ship details", check => {
            let tooltip = new ShipTooltip(testgame.view);
            let ship = testgame.view.battle.play_order[2];
            ship.fleet.player.name = "Phil";
            ship.name = "Fury";
            ship.model = new ShipModel("fake", "Fury");
            ship.listEquipment(SlotType.Weapon).forEach(equ => equ.detach());
            TestTools.setShipHP(ship, 58, 140);
            TestTools.setShipAP(ship, 12);
            TestTools.addWeapon(ship, 50);

            let sprite = nn(testgame.view.arena.findShipSprite(ship));
            sprite.active_effects = new ActiveEffectsEvent(ship,
                [new AttributeEffect("hull_capacity", 50)],
                [new StickyEffect(new DamageModifierEffect(-15), 3)],
                [new AttributeLimitEffect("precision", 10)])

            tooltip.setShip(ship);

            let content = (<any>tooltip).container.content;
            check.equals(content.children[0].name, "ship-fake-portrait");
            check.equals(content.children[1].text, "Phil's Level 1 Fury");
            check.equals(content.children[2].text, "Plays in 2 turns");
            check.equals(content.children[3].text, "Hull\n58/58");
            check.equals(content.children[4].text, "Shield\n140/140");
            check.equals(content.children[5].text, "Power\n12/12");
            check.equals(content.children[6].text, "Active effects");
            check.equals(content.children[7].text, "• limit precision to 10");
            check.equals(content.children[8].text, "• damage -15% for 3 turns");
            check.equals(content.children[9].text, "Weapons");
            check.equals(content.children[10].text, "• equipment Mk1");
        });
    });
}

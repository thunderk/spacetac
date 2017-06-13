module TS.SpaceTac.UI.Specs {
    describe("ShipTooltip", function () {
        let testgame = setupBattleview();

        it("fills ship details", function () {
            let tooltip = new ShipTooltip(testgame.battleview);
            let ship = testgame.battleview.battle.play_order[2];
            ship.name = "Fury";
            ship.model = new ShipModel("fake", "Fury");
            ship.listEquipment(SlotType.Weapon).forEach(equ => equ.detach());
            TestTools.setShipHP(ship, 58, 140);
            TestTools.setShipAP(ship, 12);
            TestTools.addWeapon(ship, 50);

            let sprite = nn(testgame.battleview.arena.findShipSprite(ship));
            sprite.active_effects = new ActiveEffectsEvent(ship,
                [new AttributeEffect("hull_capacity", 50)],
                [new StickyEffect(new DamageModifierEffect(-15), 3)],
                [new AttributeLimitEffect("precision", 10)])

            tooltip.setShip(ship);

            let content = (<any>tooltip).container.content;
            expect(content.children[0].data.key).toBe("ship-fake-portrait");
            expect(content.children[1].text).toBe("Fury");
            expect(content.children[2].text).toBe("Plays in 2 turns");
            expect(content.children[3].text).toBe("Hull\n58");
            expect(content.children[4].text).toBe("Shield\n140");
            expect(content.children[5].text).toBe("Power\n12");
            expect(content.children[6].text).toBe("Active effects");
            expect(content.children[7].text).toBe("• limit precision to 10");
            expect(content.children[8].text).toBe("• damage -15% for 3 turns");
            expect(content.children[9].text).toBe("Weapons");
            expect(content.children[10].text).toBe("• equipment Mk1");
        });
    });
}

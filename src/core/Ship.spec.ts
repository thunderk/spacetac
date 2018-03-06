module TK.SpaceTac.Specs {
    testing("Ship", test => {
        test.case("creates a full name", check => {
            let ship = new Ship();
            check.equals(ship.getName(false), "Ship");
            check.equals(ship.getName(true), "Level 1 Ship");

            ship.model = new ShipModel("test", "Hauler");
            check.equals(ship.getName(false), "Hauler");
            check.equals(ship.getName(true), "Level 1 Hauler");

            ship.name = "Titan-W12";
            check.equals(ship.getName(false), "Titan-W12");
            check.equals(ship.getName(true), "Level 1 Titan-W12");

            ship.level.forceLevel(3);
            check.equals(ship.getName(false), "Titan-W12");
            check.equals(ship.getName(true), "Level 3 Titan-W12");
        });

        test.case("moves in the arena", check => {
            let ship = new Ship(null, "Test");
            let engine = TestTools.addEngine(ship, 50);

            check.equals(ship.arena_x, 0);
            check.equals(ship.arena_y, 0);
            check.equals(ship.arena_angle, 0);

            ship.setArenaFacingAngle(1.2);
            ship.setArenaPosition(12, 50);

            check.equals(ship.arena_x, 12);
            check.equals(ship.arena_y, 50);
            check.nears(ship.arena_angle, 1.2);
        });

        test.case("applies permanent effects of ship model on attributes", check => {
            let model = new ShipModel();
            let ship = new Ship(null, null, model);

            check.patch(model, "getEffects", () => [
                new AttributeEffect("power_capacity", 4),
                new AttributeEffect("power_capacity", 5),
            ]);

            ship.updateAttributes();
            check.equals(ship.getAttribute("power_capacity"), 9);
        });

        test.case("repairs hull and recharges shield", check => {
            var ship = new Ship(null, "Test");

            TestTools.setAttribute(ship, "hull_capacity", 120);
            TestTools.setAttribute(ship, "shield_capacity", 150);

            check.equals(ship.getValue("hull"), 0);
            check.equals(ship.getValue("shield"), 0);

            ship.restoreHealth();

            check.equals(ship.getValue("hull"), 120);
            check.equals(ship.getValue("shield"), 150);
        });

        test.case("checks if a ship is able to play", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            ship.setValue("hull", 10);

            check.equals(ship.isAbleToPlay(), false);
            check.equals(ship.isAbleToPlay(false), true);

            ship.setValue("power", 5);

            check.equals(ship.isAbleToPlay(), true);
            check.equals(ship.isAbleToPlay(false), true);

            ship.setDead();

            check.equals(ship.isAbleToPlay(), false);
            check.equals(ship.isAbleToPlay(false), false);
        });

        test.case("checks if a ship is inside a given circle", check => {
            let ship = new Ship();
            ship.arena_x = 5;
            ship.arena_y = 8;

            check.equals(ship.isInCircle(5, 8, 0), true);
            check.equals(ship.isInCircle(5, 8, 1), true);
            check.equals(ship.isInCircle(5, 7, 1), true);
            check.equals(ship.isInCircle(6, 9, 1.7), true);
            check.equals(ship.isInCircle(5, 8.1, 0), false);
            check.equals(ship.isInCircle(5, 7, 0.9), false);
            check.equals(ship.isInCircle(12, -4, 5), false);
        });

        test.case("restores as new at the end of battle", check => {
            let ship = new Ship();
            TestTools.setShipModel(ship, 10, 20, 5);
            ship.setValue("hull", 5);
            ship.setValue("shield", 15);
            ship.setValue("power", 2);
            ship.active_effects.add(new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 12));
            ship.updateAttributes();
            let action1 = new BaseAction("action1");
            ship.actions.addCustom(action1);
            let action2 = new ToggleAction("action2");
            ship.actions.addCustom(action2);
            ship.actions.toggle(action2, true);
            let action3 = new ToggleAction("action3");
            ship.actions.addCustom(action3);

            check.in("before", check => {
                check.equals(ship.getValue("hull"), 5, "hull");
                check.equals(ship.getValue("shield"), 15, "shield");
                check.equals(ship.getValue("power"), 2, "power");
                check.equals(ship.active_effects.count(), 1, "effects count");
                check.equals(ship.getAttribute("power_capacity"), 3, "power capacity");
                check.equals(ship.actions.isToggled(action2), true, "action 2 activation");
                check.equals(ship.actions.isToggled(action3), false, "action 3 activation");
            });

            ship.restoreInitialState();

            check.in("after", check => {
                check.equals(ship.getValue("hull"), 10, "hull");
                check.equals(ship.getValue("shield"), 20, "shield");
                check.equals(ship.getValue("power"), 5, "power");
                check.equals(ship.active_effects.count(), 0, "effects count");
                check.equals(ship.getAttribute("power_capacity"), 5, "power capacity");
                check.equals(ship.actions.isToggled(action2), false, "action 2 activation");
                check.equals(ship.actions.isToggled(action3), false, "action 3 activation");
            });
        });

        test.case("lists active effects", check => {
            let ship = new Ship();
            check.equals(imaterialize(ship.ieffects()), []);

            let effect1 = new AttributeEffect("precision", 4);
            check.patch(ship.model, "getEffects", () => [effect1]);
            check.equals(imaterialize(ship.ieffects()), [effect1]);

            let effect2 = new AttributeLimitEffect("precision", 2);
            ship.active_effects.add(new StickyEffect(effect2, 4));
            check.equals(imaterialize(ship.ieffects()), [effect1, effect2]);
        });

        test.case("gets a textual description of an attribute", check => {
            let ship = new Ship();
            check.equals(ship.getAttributeDescription("maneuvrability"), "Ability to move first, fast and to evade weapons");

            check.patch(ship, "getUpgrades", () => [
                { code: "Base", effects: [new AttributeEffect("maneuvrability", 3)] },
                { code: "Up1", effects: [new AttributeEffect("precision", 1)] },
                { code: "Up2", effects: [new AttributeEffect("precision", 1), new AttributeEffect("maneuvrability", 1)] }
            ]);
            check.equals(ship.getAttributeDescription("maneuvrability"), "Ability to move first, fast and to evade weapons\n\nBase: +3\nUp2: +1");

            ship.active_effects.add(new StickyEffect(new AttributeLimitEffect("maneuvrability", 3)));
            check.equals(ship.getAttributeDescription("maneuvrability"), "Ability to move first, fast and to evade weapons\n\nBase: +3\nUp2: +1\nSticky effect: limit to 3");

            ship.active_effects.remove(ship.active_effects.list()[0]);
            ship.active_effects.add(new AttributeEffect("maneuvrability", -1));
            check.equals(ship.getAttributeDescription("maneuvrability"), "Ability to move first, fast and to evade weapons\n\nBase: +3\nUp2: +1\nActive effect: -1");
        });

        test.case("produces death diffs", check => {
            let battle = TestTools.createBattle(1);
            let ship = nn(battle.playing_ship);

            check.equals(ship.getDeathDiffs(battle), [
                new ShipValueDiff(ship, "hull", -1),
                new ShipDeathDiff(battle, ship),
            ]);

            let effect1 = ship.active_effects.add(new AttributeEffect("precision", 2));
            let effect2 = ship.active_effects.add(new StickyEffect(new AttributeLimitEffect("maneuvrability", 1)));
            let action1 = ship.actions.addCustom(new ToggleAction("weapon1", { power: 3 }));
            let action2 = ship.actions.addCustom(new ToggleAction("weapon2", { power: 3 }));
            ship.actions.toggle(action2, true);

            check.equals(ship.getDeathDiffs(battle), [
                new ShipEffectRemovedDiff(ship, effect1),
                new ShipAttributeDiff(ship, "precision", {}, { cumulative: 2 }),
                new ShipEffectRemovedDiff(ship, effect2),
                new ShipAttributeDiff(ship, "maneuvrability", {}, { limit: 1 }),
                new ShipActionToggleDiff(ship, action2, false),
                new ShipValueDiff(ship, "hull", -1),
                new ShipDeathDiff(battle, ship),
            ]);
        });
    });
}

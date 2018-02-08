module TK.SpaceTac.Specs {
    testing("TriggerAction", test => {
        test.case("constructs correctly", check => {
            let action = new TriggerAction("testweapon", { power: 4, range: 30, blast: 10 });
            check.equals(action.code, "testweapon");
            check.equals(action.getVerb(), "Fire");

            action = new TriggerAction("testweapon", { blast: 10 });
            check.equals(action.getVerb(), "Trigger");
        })

        test.case("applies effects to alive ships in blast radius", check => {
            let fleet = new Fleet();
            let ship = new Ship(fleet, "ship");
            let effect = new BaseEffect("testeffect");
            let mock_apply = check.patch(effect, "getOnDiffs");
            let action = new TriggerAction("testweapon", { power: 5, range: 100, blast: 10, effects: [effect] });

            TestTools.setShipModel(ship, 100, 0, 10);
            ship.actions.addCustom(action);

            let ship1 = new Ship(fleet, "ship1");
            ship1.setArenaPosition(65, 72);
            let ship2 = new Ship(fleet, "ship2");
            ship2.setArenaPosition(45, 48);
            let ship3 = new Ship(fleet, "ship3");
            ship3.setArenaPosition(45, 48);
            ship3.alive = false;

            let battle = new Battle(fleet);
            battle.play_order = [ship, ship1, ship2, ship3];
            TestTools.setShipPlaying(battle, ship);
            fleet.setBattle(battle);

            action.apply(battle, ship, Target.newFromLocation(50, 50));
            check.called(mock_apply, [
                [ship2, ship, 1]
            ]);
        })

        test.case("transforms ship target in location target, when the weapon has blast radius", check => {
            let ship1 = new Ship();
            ship1.setArenaPosition(50, 10);
            let ship2 = new Ship();
            ship2.setArenaPosition(150, 10);
            let action = TestTools.addWeapon(ship1, 1, 0, 100, 30);

            let target = action.checkTarget(ship1, new Target(150, 10));
            check.equals(target, new Target(150, 10));

            target = action.checkTarget(ship1, Target.newFromShip(ship2));
            check.equals(target, new Target(150, 10));

            ship1.setArenaPosition(30, 10);

            target = action.checkTarget(ship1, Target.newFromShip(ship2));
            check.equals(target, new Target(130, 10));

            ship1.setArenaPosition(0, 10);

            target = action.checkTarget(ship1, Target.newFromShip(ship2));
            check.equals(target, new Target(100, 10));
        })

        test.case("lists impacted ships", check => {
            let ship1 = new Ship(null, "S1");
            ship1.setArenaPosition(10, 50);
            let ship2 = new Ship(null, "S2");
            ship2.setArenaPosition(40, 60);
            let ship3 = new Ship(null, "S3");
            ship3.setArenaPosition(0, 30);
            let ships = [ship1, ship2, ship3];

            let action = new TriggerAction("testaction", { range: 50 });
            check.equals(action.filterImpactedShips({ x: 0, y: 0 }, Target.newFromShip(ship2), ships), [ship2]);
            check.equals(action.filterImpactedShips({ x: 0, y: 0 }, Target.newFromLocation(10, 50), ships), []);

            action = new TriggerAction("testaction", { range: 50, blast: 40 });
            check.equals(action.filterImpactedShips({ x: 0, y: 0 }, Target.newFromLocation(20, 20), ships), [ship1, ship3]);

            action = new TriggerAction("testaction", { range: 100, angle: 30 });
            check.equals(action.filterImpactedShips({ x: 0, y: 51 }, Target.newFromLocation(30, 50), ships), [ship1, ship2]);
        })

        test.case("computes a success factor, from precision and maneuvrability", check => {
            function verify(precision: number, precision_factor: number, maneuvrability: number, maneuvrability_factor: number, result: number) {
                let ship1 = new Ship();
                let ship2 = new Ship();

                TestTools.setAttribute(ship1, "precision", precision);
                TestTools.setAttribute(ship2, "maneuvrability", maneuvrability);

                let action = new TriggerAction("testaction", { aim: precision_factor, evasion: maneuvrability_factor });
                check.nears(action.getSuccessFactor(ship1, ship2), result, 3,
                    `precision ${precision} (weight ${precision_factor}), maneuvrability ${maneuvrability} (weight ${maneuvrability_factor})`);
            }

            // no weight => always 100%
            verify(0, 0, 0, 0, 1);
            verify(10, 0, 20, 0, 1);
            verify(40, 0, -5, 0, 1);

            // precision only
            verify(0, 100, 0, 0, 0);
            verify(1, 100, 1, 0, 0.5);
            verify(2, 100, 2, 0, 0.8);
            verify(10, 100, 10, 0, 0.99);
            verify(1, 50, 1, 0, 0.75);

            // maneuvrability only
            verify(0, 0, 0, 100, 1);
            verify(1, 0, 1, 100, 0.5);
            verify(2, 0, 2, 100, 0.2);
            verify(10, 0, 10, 100, 0.01);
            verify(1, 0, 1, 50, 0.75);

            // precision vs maneuvrability
            verify(0, 100, 0, 100, 0);
            verify(4, 50, 4, 50, 0.5);
            verify(4, 50, 8, 50, 0.283);
            verify(4, 50, 20, 50, 0.016);
            verify(4, 50, 4, 50, 0.5);
            verify(8, 50, 4, 50, 0.717);
            verify(20, 50, 4, 50, 0.984);

            // complex example
            verify(7, 20, 5, 40, 0.639);
        })

        test.case("computes an effective success value, with random element", check => {
            function verify(success_base: number, luck: number, random: number, expected: number) {
                let ship1 = new Ship();
                let ship2 = new Ship();
                let action = new TriggerAction("testaction", { luck: luck });
                check.patch(action, "getSuccessFactor", () => success_base);
                check.nears(action.getEffectiveSuccess(ship1, ship2, new SkewedRandomGenerator([random])), expected, 5,
                    `success ${success_base}, luck ${luck}, random ${random}`);
            }

            // no luck influence
            verify(0.3, 0, 0.4, 0.3);
            verify(0.51, 0, 0.7, 0.51);

            // small luck influence
            verify(0.5, 5, 0.0, 0);
            verify(0.5, 5, 0.1, 0.47979);
            verify(0.5, 5, 0.4, 0.49715);
            verify(0.5, 5, 0.8, 0.51161);
            verify(0.5, 5, 1.0, 1.0);
            verify(0.7, 5, 0.5, 0.69399);

            // large luck influence
            verify(0.5, 45, 0.0, 0);
            verify(0.5, 45, 0.1, 0.31336);
            verify(0.5, 45, 0.4, 0.46864);
            verify(0.5, 45, 0.8, 0.61679);
            verify(0.5, 45, 1.0, 1);
            verify(0.7, 45, 0.5, 0.63485);
        })

        test.case("guesses targetting mode", check => {
            let ship = new Ship();
            let action = new TriggerAction("testaction");
            check.equals(action.getTargettingMode(ship), ActionTargettingMode.SELF_CONFIRM, "self");

            action = new TriggerAction("testaction", { range: 50 });
            check.equals(action.getTargettingMode(ship), ActionTargettingMode.SHIP, "ship");

            action = new TriggerAction("testaction", { range: 50, blast: 20 });
            check.equals(action.getTargettingMode(ship), ActionTargettingMode.SPACE, "blast");

            action = new TriggerAction("testaction", { blast: 20 });
            check.equals(action.getTargettingMode(ship), ActionTargettingMode.SURROUNDINGS, "surroundings");

            action = new TriggerAction("testaction", { range: 50, angle: 15 });
            check.equals(action.getTargettingMode(ship), ActionTargettingMode.SPACE, "angle");
        })

        test.case("rotates toward the target", check => {
            let battle = TestTools.createBattle();
            let ship = battle.play_order[0];
            let action = TestTools.addWeapon(ship, 1, 0, 100, 30);
            check.patch(action, "checkTarget", (ship: Ship, target: Target) => target);
            check.equals(ship.arena_angle, 0);

            let result = action.apply(battle, ship, Target.newFromLocation(10, 20));
            check.equals(result, true);
            check.nears(ship.arena_angle, 1.107, 3);

            result = action.apply(battle, ship, Target.newFromShip(ship));
            check.equals(result, true);
            check.nears(ship.arena_angle, 1.107, 3);
        })

        test.case("builds a textual description", check => {
            let action = new TriggerAction();
            check.equals(action.getEffectsDescription(), "");

            let effects: BaseEffect[] = [new AttributeMultiplyEffect("precision", 20)];
            action.configureTrigger({ effects: effects, power: 0 });
            check.equals(action.getEffectsDescription(), "Trigger:\n• precision +20% on self");

            action.configureTrigger({ effects: effects, power: 2 });
            check.equals(action.getEffectsDescription(), "Trigger (power 2):\n• precision +20% on self");

            action.configureTrigger({ effects: effects, power: 2, range: 120 });
            check.equals(action.getEffectsDescription(), "Fire (power 2, range 120km):\n• precision +20% on target");

            action.configureTrigger({ effects: effects, power: 2, range: 120, aim: 10 });
            check.equals(action.getEffectsDescription(), "Fire (power 2, range 120km, aim +10%):\n• precision +20% on target");

            action.configureTrigger({ effects: effects, power: 2, range: 120, aim: 10, evasion: 35 });
            check.equals(action.getEffectsDescription(), "Fire (power 2, range 120km, aim +10%, evasion -35%):\n• precision +20% on target");

            action.configureTrigger({ effects: effects, power: 2, range: 120, aim: 10, evasion: 35, angle: 80 });
            check.equals(action.getEffectsDescription(), "Fire (power 2, range 120km, aim +10%, evasion -35%):\n• precision +20% in 80° arc");

            action.configureTrigger({ effects: effects, power: 2, range: 120, aim: 10, evasion: 35, blast: 100, angle: 80 });
            check.equals(action.getEffectsDescription(), "Fire (power 2, range 120km, aim +10%, evasion -35%):\n• precision +20% in 100km radius");

            action.configureTrigger({ effects: effects, power: 2, range: 120, aim: 10, evasion: 35, blast: 100, angle: 80, luck: 15 });
            check.equals(action.getEffectsDescription(), "Fire (power 2, range 120km, aim +10%, evasion -35%, luck ±15%):\n• precision +20% in 100km radius");
        })
    });
}

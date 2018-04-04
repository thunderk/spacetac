module TK.SpaceTac.Specs {
    testing("VigilanceAction", test => {
        test.case("configures", check => {
            let ship = new Ship();
            let action = new VigilanceAction("Reactive Fire", { power: 2, radius: 120 }, { intruder_count: 3 }, "reactfire");
            ship.actions.addCustom(action);

            check.equals(action.code, "reactfire");
            check.equals(action.getPowerUsage(ship, null), 2);
            check.equals(action.radius, 120);
            check.equals(action.intruder_count, 3);
            check.equals(action.getRangeRadius(ship), 0);
            check.equals(action.getTargettingMode(ship), ActionTargettingMode.SURROUNDINGS);
            check.equals(action.getVerb(ship), "Watch with");

            ship.actions.toggle(action, true);
            check.equals(action.getVerb(ship), "Stop");
            check.equals(action.getPowerUsage(ship, null), -2);
            check.equals(action.getTargettingMode(ship), ActionTargettingMode.SELF_CONFIRM);
        });

        test.case("builds a textual description", check => {
            let action = new VigilanceAction("Reactive Fire", { power: 2, radius: 120 }, {
                intruder_count: 0,
                intruder_effects: [new ValueEffect("hull", -1)]
            });
            check.equals(action.getEffectsDescription(), "Watch a 120km area (power usage 2):\n• hull -1 on all incoming ships");

            action = new VigilanceAction("Reactive Fire", { power: 2, radius: 120 }, {
                intruder_count: 1,
                intruder_effects: [new ValueEffect("hull", -1)]
            });
            check.equals(action.getEffectsDescription(), "Watch a 120km area (power usage 2):\n• hull -1 on the first incoming ship");

            action = new VigilanceAction("Reactive Fire", { power: 2, radius: 120 }, {
                intruder_count: 3,
                intruder_effects: [new ValueEffect("hull", -1)]
            });
            check.equals(action.getEffectsDescription(), "Watch a 120km area (power usage 2):\n• hull -1 on the first 3 incoming ships");

            action = new VigilanceAction("Reactive Fire", { power: 2, radius: 120, filter: ActionTargettingFilter.ALLIES }, {
                intruder_count: 3,
                intruder_effects: [new ValueEffect("hull", -1)]
            });
            check.equals(action.getEffectsDescription(), "Watch a 120km area (power usage 2):\n• hull -1 on the first 3 incoming team members");
        });

        test.case("handles the vigilance effect to know who to target", check => {
            let battle = new Battle();
            let ship1a = battle.fleets[0].addShip();
            ship1a.setArenaPosition(0, 0);
            TestTools.setShipModel(ship1a, 10, 0, 5);
            let ship1b = battle.fleets[0].addShip();
            ship1b.setArenaPosition(800, 0);
            TestTools.setShipModel(ship1b, 10, 0, 5);
            let ship2a = battle.fleets[1].addShip();
            ship2a.setArenaPosition(800, 0);
            TestTools.setShipModel(ship2a, 10, 0, 5);
            let ship2b = battle.fleets[1].addShip();
            ship2b.setArenaPosition(1200, 0);
            TestTools.setShipModel(ship2b, 10, 0, 5);
            let engine = ship2b.actions.addCustom(new MoveAction("Move", { distance_per_power: 1000, safety_distance: 100 }));

            let action = ship1a.actions.addCustom(new VigilanceAction("Reactive Shot", { radius: 1000, filter: ActionTargettingFilter.ENEMIES }, {
                intruder_effects: [new DamageEffect(1)]
            }));

            let diffs = action.getDiffs(ship1a, battle);
            check.equals(diffs, [
                new ShipActionUsedDiff(ship1a, action, Target.newFromShip(ship1a)),
                new ShipValueDiff(ship1a, "power", -1),
                new ShipActionToggleDiff(ship1a, action, true),
                new ShipEffectAddedDiff(ship2a, action.effects[0])
            ]);
            battle.applyDiffs(diffs);

            check.equals(ship1a.active_effects.list(), []);
            check.equals(ship1b.active_effects.list(), []);
            check.equals(ship2a.active_effects.list(), [action.effects[0]]);
            check.equals(ship2b.active_effects.list(), []);

            check.equals(ship1a.getValue("hull"), 10);
            check.equals(ship1b.getValue("hull"), 10);
            check.equals(ship2a.getValue("hull"), 10);
            check.equals(ship2b.getValue("hull"), 10);

            TestTools.setShipPlaying(battle, ship2b);
            battle.applyOneAction(engine.id, Target.newFromLocation(500, 0));

            check.equals(ship1a.active_effects.list(), []);
            check.equals(ship1b.active_effects.list(), []);
            check.equals(ship2a.active_effects.list(), [action.effects[0]]);
            check.equals(ship2b.active_effects.list(), [action.effects[0]]);

            check.equals(ship1a.getValue("hull"), 10);
            check.equals(ship1b.getValue("hull"), 10);
            check.equals(ship2a.getValue("hull"), 10);
            check.equals(ship2b.getValue("hull"), 9);

            battle.applyOneAction(engine.id, Target.newFromLocation(400, 0));
            check.equals(ship2b.getValue("hull"), 9);

            battle.applyOneAction(engine.id, Target.newFromLocation(1200, 0));
            battle.applyOneAction(engine.id, Target.newFromLocation(700, 0));
            check.equals(ship2b.getValue("hull"), 8);
        });
    });
}
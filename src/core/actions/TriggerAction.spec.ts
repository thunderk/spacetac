module TK.SpaceTac {
    describe("TriggerAction", function () {
        it("constructs correctly", function () {
            let equipment = new Equipment(SlotType.Weapon, "testweapon");
            let action = new TriggerAction(equipment, [], 4, 30, 10);

            expect(action.code).toEqual("fire-testweapon");
            expect(action.name).toEqual("Fire");
            expect(action.equipment).toBe(equipment);
        })

        it("applies effects to alive ships in blast radius", function () {
            let fleet = new Fleet();
            let ship = new Ship(fleet, "ship");
            let equipment = new Equipment(SlotType.Weapon, "testweapon");
            let effect = new BaseEffect("testeffect");
            let mock_apply = spyOn(effect, "applyOnShip").and.stub();
            let action = new TriggerAction(equipment, [effect], 5, 100, 10);

            TestTools.setShipAP(ship, 10);

            let ship1 = new Ship(fleet, "ship1");
            ship1.setArenaPosition(65, 72);
            let ship2 = new Ship(fleet, "ship2");
            ship2.setArenaPosition(45, 48);
            let ship3 = new Ship(fleet, "ship3");
            ship3.setArenaPosition(45, 48);
            ship3.alive = false;

            let battle = new Battle(fleet);
            battle.play_order = [ship, ship1, ship2, ship3];
            battle.playing_ship = ship;
            fleet.setBattle(battle);

            action.apply(ship, Target.newFromLocation(50, 50));
            expect(mock_apply).toHaveBeenCalledTimes(1);
            expect(mock_apply).toHaveBeenCalledWith(ship2, ship);
        })

        it("transforms ship target in location target, when the weapon has blast radius", function () {
            let ship1 = new Ship();
            ship1.setArenaPosition(50, 10);
            let ship2 = new Ship();
            ship2.setArenaPosition(150, 10);
            let weapon = TestTools.addWeapon(ship1, 1, 0, 100, 30);
            let action = nn(weapon.action);

            let target = action.checkTarget(ship1, new Target(150, 10));
            expect(target).toEqual(new Target(150, 10));

            target = action.checkTarget(ship1, Target.newFromShip(ship2));
            expect(target).toEqual(new Target(150, 10));

            ship1.setArenaPosition(30, 10);

            target = action.checkTarget(ship1, Target.newFromShip(ship2));
            expect(target).toEqual(new Target(130, 10));

            ship1.setArenaPosition(0, 10);

            target = action.checkTarget(ship1, Target.newFromShip(ship2));
            expect(target).toEqual(new Target(100, 10));
        })

        it("lists impacted ships", function () {
            let ship1 = new Ship(null, "S1");
            ship1.setArenaPosition(10, 50);
            let ship2 = new Ship(null, "S2");
            ship2.setArenaPosition(40, 60);
            let ship3 = new Ship(null, "S3");
            ship3.setArenaPosition(0, 30);
            let ships = [ship1, ship2, ship3];

            let action = new TriggerAction(new Equipment(), [], 1, 50);
            expect(action.filterImpactedShips({ x: 0, y: 0 }, Target.newFromShip(ship2), ships)).toEqual([ship2]);
            expect(action.filterImpactedShips({ x: 0, y: 0 }, Target.newFromLocation(10, 50), ships)).toEqual([]);

            action = new TriggerAction(new Equipment(), [], 1, 50, 40);
            expect(action.filterImpactedShips({ x: 0, y: 0 }, Target.newFromLocation(20, 20), ships)).toEqual([ship1, ship3]);

            action = new TriggerAction(new Equipment(), [], 1, 100, 0, 30);
            expect(action.filterImpactedShips({ x: 0, y: 51 }, Target.newFromLocation(30, 50), ships)).toEqual([ship1, ship2]);
        })

        it("guesses targetting mode", function () {
            let ship = new Ship();
            let equ = new Equipment();
            let action = new TriggerAction(equ, []);
            expect(action.getTargettingMode(ship)).toEqual(ActionTargettingMode.SELF_CONFIRM, "self");

            action = new TriggerAction(equ, [], 1, 50);
            expect(action.getTargettingMode(ship)).toEqual(ActionTargettingMode.SHIP, "ship");

            action = new TriggerAction(equ, [], 1, 50, 20);
            expect(action.getTargettingMode(ship)).toEqual(ActionTargettingMode.SPACE, "blast");

            action = new TriggerAction(equ, [], 1, 0, 20);
            expect(action.getTargettingMode(ship)).toEqual(ActionTargettingMode.SURROUNDINGS, "surroundings");

            action = new TriggerAction(equ, [], 1, 50, 0, 15);
            expect(action.getTargettingMode(ship)).toEqual(ActionTargettingMode.SPACE, "angle");
        })

        it("rotates toward the target", function () {
            let ship = new Ship();
            let weapon = TestTools.addWeapon(ship, 1, 0, 100, 30);
            let action = nn(weapon.action);
            spyOn(action, "checkTarget").and.callFake((ship: Ship, target: Target) => target);
            expect(ship.arena_angle).toEqual(0);

            let result = action.apply(ship, Target.newFromLocation(10, 20));
            expect(result).toBe(true);
            expect(ship.arena_angle).toBeCloseTo(1.107, 0.001);

            result = action.apply(ship, Target.newFromShip(ship));
            expect(result).toBe(true);
            expect(ship.arena_angle).toBeCloseTo(1.107, 0.001);
        })
    });
}

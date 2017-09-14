/// <reference path="../effects/BaseEffect.ts" />

module TS.SpaceTac {
    describe("FireWeaponAction", function () {
        it("constructs correctly", function () {
            let equipment = new Equipment(SlotType.Weapon, "testweapon");
            let action = new FireWeaponAction(equipment, 4, 30, 10);

            expect(action.code).toEqual("fire-testweapon");
            expect(action.name).toEqual("Fire");
            expect(action.equipment).toBe(equipment);
            expect(action.needs_target).toBe(true);

            action = new FireWeaponAction(equipment, 4, 0, 10);
            expect(action.needs_target).toBe(false);
        });

        it("applies effects to alive ships in blast radius", function () {
            let fleet = new Fleet();
            let ship = new Ship(fleet, "ship");
            let equipment = new Equipment(SlotType.Weapon, "testweapon");
            let effect = new BaseEffect("testeffect");
            let mock_apply = spyOn(effect, "applyOnShip").and.stub();
            let action = new FireWeaponAction(equipment, 5, 100, 10, [effect]);

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
        });

        it("transforms ship target in location target, when the weapon has blast radius", function () {
            let ship1 = new Ship();
            ship1.setArenaPosition(50, 10);
            let ship2 = new Ship();
            ship2.setArenaPosition(150, 10);
            let weapon = TestTools.addWeapon(ship1, 1, 0, 100, 30);

            let target = weapon.action.checkTarget(ship1, new Target(150, 10));
            expect(target).toEqual(new Target(150, 10));

            target = weapon.action.checkTarget(ship1, Target.newFromShip(ship2));
            expect(target).toEqual(new Target(150, 10));

            ship1.setArenaPosition(30, 10);

            target = weapon.action.checkTarget(ship1, Target.newFromShip(ship2));
            expect(target).toEqual(new Target(130, 10));

            ship1.setArenaPosition(0, 10);

            target = weapon.action.checkTarget(ship1, Target.newFromShip(ship2));
            expect(target).toEqual(new Target(100, 10));
        });

        it("rotates toward the target", function () {
            let ship = new Ship();
            let weapon = TestTools.addWeapon(ship, 1, 0, 100, 30);
            expect(ship.arena_angle).toEqual(0);

            let result = weapon.action.apply(ship, Target.newFromLocation(10, 20));
            expect(result).toBe(true);
            expect(ship.arena_angle).toBeCloseTo(1.107, 0.001);

            weapon.action.needs_target = false;
            result = weapon.action.apply(ship, null);
            expect(result).toBe(true);
            expect(ship.arena_angle).toBeCloseTo(1.107, 0.001);
        });
    });
}

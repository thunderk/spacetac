/// <reference path="../effects/BaseEffect.ts" />

module TS.SpaceTac {
    describe("FireWeaponAction", function () {
        it("constructs correctly", function () {
            let equipment = new Equipment(SlotType.Weapon, "testweapon");
            let action = new FireWeaponAction(equipment);

            expect(action.code).toEqual("fire-testweapon");
            expect(action.name).toEqual("Fire");
            expect(action.equipment).toBe(equipment);
            expect(action.needs_target).toBe(true);
        });

        it("applies effects to alive ships in blast radius", function () {
            let fleet = new Fleet();
            let ship = new Ship(fleet);
            let equipment = new Equipment(SlotType.Weapon, "testweapon");
            equipment.blast = 10;
            equipment.ap_usage = 5;
            equipment.distance = 100;
            let effect = new BaseEffect("testeffect");
            let mock_apply = spyOn(effect, "applyOnShip").and.stub();
            equipment.target_effects.push(effect);
            let action = new FireWeaponAction(equipment, true);

            TestTools.setShipAP(ship, 10);

            let ship1 = new Ship(fleet);
            ship1.setArenaPosition(65, 72);
            let ship2 = new Ship(fleet);
            ship2.setArenaPosition(45, 48);
            let ship3 = new Ship(fleet);
            ship3.setArenaPosition(45, 48);
            ship3.alive = false;

            let battle = new Battle(fleet);
            battle.play_order = [ship, ship1, ship2, ship3];
            battle.playing_ship = ship;
            fleet.setBattle(battle);

            action.apply(ship, Target.newFromLocation(50, 50));
            expect(mock_apply).toHaveBeenCalledTimes(1);
            expect(mock_apply).toHaveBeenCalledWith(ship2);
        });
    });
}

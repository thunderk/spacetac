module TS.SpaceTac.Specs {
    describe("Maneuver", function () {
        it("guesses weapon effects", function () {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[0].addShip();
            let ship3 = battle.fleets[1].addShip();
            let weapon = TestTools.addWeapon(ship1, 50, 0, 100, 10);
            ship1.setArenaPosition(0, 0);
            TestTools.setShipHP(ship1, 20, 20);
            ship2.setArenaPosition(0, 5);
            TestTools.setShipHP(ship2, 30, 30);
            ship3.setArenaPosition(0, 15);
            TestTools.setShipHP(ship3, 30, 30);
            let maneuver = new Maneuver(ship1, weapon.action, Target.newFromLocation(0, 0));
            expect(maneuver.effects).toEqual([
                [ship1, new DamageEffect(50)],
                [ship2, new DamageEffect(50)]
            ]);
        });

        it("guesses drone effects", function () {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[0].addShip();
            let ship3 = battle.fleets[1].addShip();
            let weapon = ship1.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            weapon.action = new DeployDroneAction(weapon, 0, 100, 1, 10, [new ValueEffect("shield", 10)]);
            ship1.setArenaPosition(0, 0);
            TestTools.setShipHP(ship1, 20, 20);
            ship2.setArenaPosition(0, 5);
            TestTools.setShipHP(ship2, 30, 30);
            ship3.setArenaPosition(0, 15);
            TestTools.setShipHP(ship3, 30, 30);
            let maneuver = new Maneuver(ship1, weapon.action, Target.newFromLocation(0, 0));
            expect(maneuver.effects).toEqual([
                [ship1, new ValueEffect("shield", 10)],
                [ship2, new ValueEffect("shield", 10)]
            ]);
        });
    });
}

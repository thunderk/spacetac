module TS.SpaceTac.Specs {
    describe("SubMunitionMissile", () => {
        it("hits several targets in circle", () => {
            var battle = TestTools.createBattle(1, 2);

            var ship = battle.fleets[0].ships[0];
            ship.setArenaPosition(0, 0);
            TestTools.setShipAP(ship, 100);
            TestTools.setShipHP(ship, 50, 30);
            var enemy1 = battle.fleets[1].ships[0];
            enemy1.setArenaPosition(0, 1);
            TestTools.setShipHP(enemy1, 50, 30);
            var enemy2 = battle.fleets[1].ships[1];
            enemy2.setArenaPosition(0, 2);
            TestTools.setShipHP(enemy2, 50, 30);

            var template = new Equipments.SubMunitionMissile();
            var equipment = template.generateFixed(0);
            equipment.distance = 5;
            equipment.blast = 1.5;
            (<DamageEffect>equipment.target_effects[0]).value = 20;

            var checkHP = (h1: number, s1: number, h2: number, s2: number, h3: number, s3: number): void => {
                expect(ship.values.hull.get()).toBe(h1);
                expect(ship.values.shield.get()).toBe(s1);
                expect(enemy1.values.hull.get()).toBe(h2);
                expect(enemy1.values.shield.get()).toBe(s2);
                expect(enemy2.values.hull.get()).toBe(h3);
                expect(enemy2.values.shield.get()).toBe(s3);
            };
            checkHP(50, 30, 50, 30, 50, 30);

            battle.log.clear();
            battle.log.addFilter("value");

            // Fire at a ship
            var t = Target.newFromShip(enemy1);
            expect(equipment.action.canBeUsed(battle, ship)).toBe(true);
            equipment.action.apply(battle, ship, t);
            checkHP(50, 10, 50, 10, 50, 10);
            expect(battle.log.events.length).toBe(4);
            expect(battle.log.events[0]).toEqual(new FireEvent(ship, equipment, t));
            expect(battle.log.events[1]).toEqual(new DamageEvent(ship, 0, 20));
            expect(battle.log.events[2]).toEqual(new DamageEvent(enemy1, 0, 20));
            expect(battle.log.events[3]).toEqual(new DamageEvent(enemy2, 0, 20));

            battle.log.clear();

            // Fire in space
            t = Target.newFromLocation(0, 2.4);
            expect(equipment.action.canBeUsed(battle, ship)).toBe(true);
            equipment.action.apply(battle, ship, t);
            checkHP(50, 10, 40, 0, 40, 0);
            expect(battle.log.events.length).toBe(3);
            expect(battle.log.events[0]).toEqual(new FireEvent(ship, equipment, t));
            expect(battle.log.events[1]).toEqual(new DamageEvent(enemy1, 10, 10));
            expect(battle.log.events[2]).toEqual(new DamageEvent(enemy2, 10, 10));

            battle.log.clear();

            // Fire far away
            t = Target.newFromLocation(0, 5);
            expect(equipment.action.canBeUsed(battle, ship)).toBe(true);
            equipment.action.apply(battle, ship, t);
            checkHP(50, 10, 40, 0, 40, 0);
            expect(battle.log.events.length).toBe(1);
            expect(battle.log.events[0]).toEqual(new FireEvent(ship, equipment, t));
        });
    });
}

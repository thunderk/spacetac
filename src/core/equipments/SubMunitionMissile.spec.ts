module TS.SpaceTac.Equipments {
    describe("SubMunitionMissile", function () {
        it("generates equipment based on level", function () {
            let template = new SubMunitionMissile();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_materials": 1, "skill_photons": 1 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 4, 500, 150, [new DamageEffect(26, 4)]));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.price).toEqual(163);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_materials": 2, "skill_photons": 1 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 4, 520, 155, [new DamageEffect(28, 5)]));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.price).toEqual(570);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 3, "skill_photons": 2 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 4, 544, 161, [new DamageEffect(30, 6)]));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.price).toEqual(1385);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 20, "skill_photons": 13 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 4, 824, 231, [new DamageEffect(58, 20)]));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.price).toEqual(18500);
        });

        it("hits several targets in circle", function () {
            var battle = TestTools.createBattle(1, 2);

            var ship = battle.fleets[0].ships[0];
            ship.setArenaPosition(0, 0);
            TestTools.setShipAP(ship, 100);
            TestTools.setShipHP(ship, 50, 30);
            var enemy1 = battle.fleets[1].ships[0];
            enemy1.setArenaPosition(1, 0);
            TestTools.setShipHP(enemy1, 50, 30);
            var enemy2 = battle.fleets[1].ships[1];
            enemy2.setArenaPosition(2, 0);
            TestTools.setShipHP(enemy2, 50, 30);

            var template = new Equipments.SubMunitionMissile();
            var equipment = template.generate(1);
            let action = <FireWeaponAction>nn(equipment.action);
            action.range = 5;
            action.blast = 1.5;
            (<DamageEffect>action.effects[0]).base = 20;
            (<DamageEffect>action.effects[0]).span = 0;

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
            var target = Target.newFromShip(enemy1);
            expect(action.checkCannotBeApplied(ship)).toBe(null);
            action.apply(ship, target);
            checkHP(50, 10, 50, 10, 50, 10);
            expect(battle.log.events.length).toBe(5);
            expect(battle.log.events[0]).toEqual(new ActionAppliedEvent(ship, action, Target.newFromLocation(1, 0), 4));
            expect(battle.log.events[1]).toEqual(new FireEvent(ship, equipment, Target.newFromLocation(1, 0)));
            expect(battle.log.events[2]).toEqual(new DamageEvent(ship, 0, 20));
            expect(battle.log.events[3]).toEqual(new DamageEvent(enemy1, 0, 20));
            expect(battle.log.events[4]).toEqual(new DamageEvent(enemy2, 0, 20));

            battle.log.clear();
            equipment.cooldown.cool();

            // Fire in space
            target = Target.newFromLocation(2.4, 0);
            expect(action.checkCannotBeApplied(ship)).toBe(null);
            action.apply(ship, target);
            checkHP(50, 10, 40, 0, 40, 0);
            expect(battle.log.events.length).toBe(4);
            expect(battle.log.events[0]).toEqual(new ActionAppliedEvent(ship, action, target, 4));
            expect(battle.log.events[1]).toEqual(new FireEvent(ship, equipment, target));
            expect(battle.log.events[2]).toEqual(new DamageEvent(enemy1, 10, 10));
            expect(battle.log.events[3]).toEqual(new DamageEvent(enemy2, 10, 10));

            battle.log.clear();
            equipment.cooldown.cool();

            // Fire far away
            target = Target.newFromLocation(5, 0);
            expect(action.checkCannotBeApplied(ship)).toBe(null);
            action.apply(ship, target);
            checkHP(50, 10, 40, 0, 40, 0);
            expect(battle.log.events.length).toBe(2);
            expect(battle.log.events[0]).toEqual(new ActionAppliedEvent(ship, action, target, 4));
            expect(battle.log.events[1]).toEqual(new FireEvent(ship, equipment, target));
        });
    });
}

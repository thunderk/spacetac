module TK.SpaceTac.Equipments {
    describe("PowerDepleter", () => {
        it("generates equipment based on level", function () {
            let template = new PowerDepleter();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 1 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 4, 460, 0, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ]));
            expect(equipment.price).toEqual(100);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 2 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 4, 490, 0, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ]));
            expect(equipment.price).toEqual(350);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 4 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 4, 526, 0, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ]));
            expect(equipment.price).toEqual(850);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 25 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 4, 946, 0, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ]));
            expect(equipment.price).toEqual(11350);
        });

        it("limits target's AP", () => {
            var template = new PowerDepleter();
            var equipment = template.generate(1);

            var ship = new Ship();
            var target = new Ship();
            TestTools.setShipAP(ship, 50);
            TestTools.setShipAP(target, 7, 2);

            expect(target.values.power.get()).toBe(7);
            expect(target.sticky_effects).toEqual([]);

            // Attribute is immediately limited
            nn(equipment.action).apply(ship, Target.newFromShip(target));

            expect(target.values.power.get()).toBe(3);
            expect(target.sticky_effects).toEqual([
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true, false)
            ]);

            // Attribute is limited for two turns, and prevents AP recovery
            target.values.power.set(6);
            target.recoverActionPoints();
            target.startTurn();

            expect(target.values.power.get()).toBe(3);
            expect(target.sticky_effects).toEqual([
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 1, true, false)
            ]);

            target.endTurn();
            target.recoverActionPoints();
            expect(target.values.power.get()).toBe(3);
            target.startTurn();

            expect(target.sticky_effects).toEqual([]);

            // Effect vanished, so AP recovery happens
            target.endTurn();

            expect(target.values.power.get()).toBe(5);
            expect(target.sticky_effects).toEqual([]);
        });
    });
}

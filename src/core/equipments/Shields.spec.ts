module TS.SpaceTac.Equipments {
    describe("Shields", function () {
        it("generates ForceField based on level", function () {
            let template = new ForceField();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_photons": 1 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 100)]);
            expect(equipment.price).toEqual(100);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_photons": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 140)]);
            expect(equipment.price).toEqual(300);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_photons": 5 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 180)]);
            expect(equipment.price).toEqual(700);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_photons": 19 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 460)]);
            expect(equipment.price).toEqual(9100);
        });

        it("generates GravitShield based on level", function () {
            let template = new GravitShield();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_gravity": 2 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 80),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 2, 0, 300, [new RepelEffect(100)]));
            expect(equipment.price).toEqual(140);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_gravity": 5 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 110),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 2, 0, 310, [new RepelEffect(105)]));
            expect(equipment.price).toEqual(320);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_gravity": 8 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 140),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 2, 0, 320, [new RepelEffect(110)]));
            expect(equipment.price).toEqual(680);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_gravity": 29 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 350),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 2, 0, 390, [new RepelEffect(145)]));
            expect(equipment.price).toEqual(8240);
        });

        it("generates InverterShield based on level", function () {
            let template = new InverterShield();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 2 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 130),
                new AttributeEffect("power_generation", -1),
            ]);
            expect(equipment.price).toEqual(300);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 4 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 175),
                new AttributeEffect("power_generation", -1),
            ]);
            expect(equipment.price).toEqual(460);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 6 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 220),
                new AttributeEffect("power_generation", -1),
            ]);
            expect(equipment.price).toEqual(780);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 20 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 535),
                new AttributeEffect("power_generation", -3),
            ]);
            expect(equipment.price).toEqual(7500);
        });
    });
}

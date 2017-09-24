module TK.SpaceTac.Equipments {
    describe("Shields", function () {
        it("generates ForceField based on level", function () {
            let template = new ForceField();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_photons": 1 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 80)]);
            expect(equipment.price).toEqual(95);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_photons": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 112)]);
            expect(equipment.price).toEqual(332);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_photons": 5 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 150)]);
            expect(equipment.price).toEqual(807);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_photons": 33 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 598)]);
            expect(equipment.price).toEqual(10782);
        });

        it("generates GravitShield based on level", function () {
            let template = new GravitShield();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_gravity": 2 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 60),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 2, 0, 300, [new RepelEffect(100)]));
            expect(equipment.price).toEqual(140);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_gravity": 5 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 84),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 2, 0, 310, [new RepelEffect(105)]));
            expect(equipment.price).toEqual(490);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_gravity": 8 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 112),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 2, 0, 322, [new RepelEffect(111)]));
            expect(equipment.price).toEqual(1190);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_gravity": 50 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 448),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 2, 0, 462, [new RepelEffect(181)]));
            expect(equipment.price).toEqual(15890);
        });

        it("generates InverterShield based on level", function () {
            let template = new InverterShield();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 2, "skill_time": 1 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 140),
                new AttributeEffect("power_capacity", -1),
            ]);
            expect(equipment.price).toEqual(258);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 3, "skill_time": 2 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 196),
                new AttributeEffect("power_capacity", -1),
            ]);
            expect(equipment.price).toEqual(903);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 5, "skill_time": 3 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 263),
                new AttributeEffect("power_capacity", -1),
            ]);
            expect(equipment.price).toEqual(2193);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 26, "skill_time": 17 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("shield_capacity", 1047),
                new AttributeEffect("power_capacity", -4),
            ]);
            expect(equipment.price).toEqual(29283);
        });
    });
}

module TK.SpaceTac.Equipments {
    describe("RawWeapons", function () {
        it("generates GatlingGun based on level", function () {
            let template = new GatlingGun();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_materials": 1 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(30, 20)], 3, 400, 0));
            expect(equipment.price).toEqual(100);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 2));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_materials": 2 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(42, 28)], 3, 412, 0));
            expect(equipment.price).toEqual(350);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 2));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 4 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(56, 37)], 3, 426, 0));
            expect(equipment.price).toEqual(850);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 2));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 23 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(224, 149)], 3, 594, 0));
            expect(equipment.price).toEqual(11350);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 2));
        });

        it("generates SubMunitionMissile based on level", function () {
            let template = new SubMunitionMissile();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_materials": 1, "skill_photons": 1 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(26, 4)], 4, 500, 150));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.price).toEqual(163);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_materials": 2, "skill_photons": 1 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(28, 5)], 4, 520, 155));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.price).toEqual(570);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 3, "skill_photons": 2 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(30, 6)], 4, 544, 161));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.price).toEqual(1385);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 20, "skill_photons": 13 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(58, 20)], 4, 824, 231));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.price).toEqual(18500);
        });

        it("generates ProkhorovLaser based on level", function () {
            let template = new ProkhorovLaser();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_photons": 1, "skill_quantum": 1 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(20, 25)], 5, 300, 0, 40));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 1));
            expect(equipment.price).toEqual(152);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 1, "skill_photons": 2, "skill_quantum": 2 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(28, 35)], 5, 310, 0, 42));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 1));
            expect(equipment.price).toEqual(532);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 1, "skill_photons": 4, "skill_quantum": 3 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(37, 47)], 5, 322, 0, 44));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 1));
            expect(equipment.price).toEqual(1292);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 11, "skill_photons": 23, "skill_quantum": 20 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [new DamageEffect(149, 187)], 5, 462, 0, 72));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 1));
            expect(equipment.price).toEqual(17252);
        });
    });
}

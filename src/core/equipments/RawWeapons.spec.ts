module TK.SpaceTac.Equipments {
    describe("RawWeapons", function () {
        it("generates GatlingGun based on level", function () {
            let template = new GatlingGun();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_materials": 1 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 500, 0, [new DamageEffect(30, 20)]));
            expect(equipment.price).toEqual(100);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 2));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_materials": 2 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 512, 0, [new DamageEffect(42, 28)]));
            expect(equipment.price).toEqual(350);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 2));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 4 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 526, 0, [new DamageEffect(56, 37)]));
            expect(equipment.price).toEqual(850);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 2));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 23 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 694, 0, [new DamageEffect(224, 149)]));
            expect(equipment.price).toEqual(11350);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 2));
        });

        it("generates SubMunitionMissile based on level", function () {
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

        it("generates ProkhorovLaser based on level", function () {
            let template = new ProkhorovLaser();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_photons": 1 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 5, 0, 250, [new DamageEffect(20, 25)]));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 1));
            expect(equipment.price).toEqual(152);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 1, "skill_photons": 2 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 5, 0, 260, [new DamageEffect(28, 35)]));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 1));
            expect(equipment.price).toEqual(532);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 1, "skill_photons": 3 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 5, 0, 272, [new DamageEffect(37, 47)]));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 1));
            expect(equipment.price).toEqual(1292);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 11, "skill_photons": 22 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 5, 0, 412, [new DamageEffect(149, 187)]));
            expect(equipment.cooldown).toEqual(new Cooldown(1, 1));
            expect(equipment.price).toEqual(17252);
        });
    });
}

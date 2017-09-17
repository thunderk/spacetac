module TS.SpaceTac.Equipments {
    describe("GatlingGun", function () {
        it("generates equipment based on level", function () {
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
    });
}

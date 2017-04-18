module TS.SpaceTac.Equipments {
    describe("GatlingGun", function () {
        it("generates equipment based on level", function () {
            let template = new GatlingGun();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_material": 1 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 600, 0, [new DamageEffect(50)]));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_material": 2 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 600, 0, [new DamageEffect(60)]));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_material": 3 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 600, 0, [new DamageEffect(70)]));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_material": 10 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 600, 0, [new DamageEffect(140)]));
        });
    });
}

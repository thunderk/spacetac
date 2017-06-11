module TS.SpaceTac.Equipments {
    describe("GatlingGun", function () {
        it("generates equipment based on level", function () {
            let template = new GatlingGun();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_materials": 1 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 600, 0, [new DamageEffect(30, 20)]));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_materials": 2 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 600, 0, [new DamageEffect(35, 25)]));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 3 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 600, 0, [new DamageEffect(40, 30)]));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 10 });
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 600, 0, [new DamageEffect(75, 65)]));
        });
    });
}

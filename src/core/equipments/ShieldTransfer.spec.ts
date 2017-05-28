module TS.SpaceTac.Equipments {
    describe("ShieldTransfer", () => {
        it("generates equipment based on level", function () {
            let template = new ShieldTransfer();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_gravity": 1 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 100, 0, [new ValueTransferEffect("shield", -20)]));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_gravity": 2 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 110, 0, [new ValueTransferEffect("shield", -22)]));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_gravity": 3 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 120, 0, [new ValueTransferEffect("shield", -24)]));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_gravity": 10 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 190, 0, [new ValueTransferEffect("shield", -38)]));
        })
    })
}

module TS.SpaceTac.Equipments {
    describe("ShieldTransfer", () => {
        it("generates equipment based on level", function () {
            let template = new ShieldTransfer();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_gravity": 1 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 150, 0, [new ValueTransferEffect("shield", -20)]));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_gravity": 2 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 160, 0, [new ValueTransferEffect("shield", -22)]));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_gravity": 3 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 170, 0, [new ValueTransferEffect("shield", -24)]));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_gravity": 10 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 240, 0, [new ValueTransferEffect("shield", -38)]));
        })
    })
}

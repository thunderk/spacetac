module TS.SpaceTac.Equipments {
    describe("ShieldTransfer", () => {
        it("generates equipment based on level", function () {
            let template = new ShieldTransfer();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_gravity": 1 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 0, 250, [new ValueTransferEffect("shield", -40)]));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_gravity": 2 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 0, 270, [new ValueTransferEffect("shield", -44)]));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_gravity": 3 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 0, 290, [new ValueTransferEffect("shield", -48)]));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_gravity": 10 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 0, 430, [new ValueTransferEffect("shield", -76)]));
        })
    })
}

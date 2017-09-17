module TS.SpaceTac.Equipments {
    describe("ShieldTransfer", () => {
        it("generates equipment based on level", function () {
            let template = new ShieldTransfer();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_gravity": 2 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 0, 250, [
                new ValueTransferEffect("shield", -40)
            ]));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_gravity": 3 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 0, 270, [
                new ValueTransferEffect("shield", -44)
            ]));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_gravity": 5 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 0, 294, [
                new ValueTransferEffect("shield", -49)
            ]));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_gravity": 26 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 3, 0, 574, [
                new ValueTransferEffect("shield", -105)
            ]));
        })
    })
}

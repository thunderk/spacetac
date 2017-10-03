module TK.SpaceTac.Equipments {
    describe("ShieldTransfer", () => {
        it("generates equipment based on level", function () {
            let template = new ShieldTransfer();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_gravity": 2 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new TriggerAction(equipment, [
                new ValueTransferEffect("shield", -40)
            ], 3, 0, 250));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_gravity": 3 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new TriggerAction(equipment, [
                new ValueTransferEffect("shield", -44)
            ], 3, 0, 270));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_gravity": 5 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new TriggerAction(equipment, [
                new ValueTransferEffect("shield", -49)
            ], 3, 0, 294));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_gravity": 26 });
            expect(equipment.cooldown).toEqual(new Cooldown(3, 3));
            expect(equipment.action).toEqual(new TriggerAction(equipment, [
                new ValueTransferEffect("shield", -105)
            ], 3, 0, 574));
        })
    })
}

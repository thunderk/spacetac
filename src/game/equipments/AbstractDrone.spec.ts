module TS.SpaceTac.Game.Equipments {
    describe("AbstractDrone", function () {
        it("can be configured", function () {
            let template = new AbstractDrone("test");
            expect(template.name).toEqual("test");

            template.setDeployDistance(5, 8);
            expect(template.distance).toEqual(new Range(5, 8));
            template.setEffectRadius(100, 300);
            expect(template.blast).toEqual(new IntegerRange(100, 300));
            template.setLifetime(2, 3);
            expect(template.duration).toEqual(new IntegerRange(2, 3));
        });

        it("generates a drone-deploying equipment", function () {
            let template = new AbstractDrone("Test");
            template.setDeployDistance(100, 200);
            template.setEffectRadius(50, 100);
            template.setLifetime(2, 3);
            template.addDamageOnTargetEffect(20, 30);
            template.setPowerConsumption(3, 5);

            let equipment = template.generateFixed(0);
            expect(equipment.action).toEqual(new DeployDroneAction(equipment));
            expect(equipment.ap_usage).toEqual(3);
            expect(equipment.blast).toEqual(50);
            expect(equipment.code).toEqual("test");
            expect(equipment.distance).toEqual(100);
            expect(equipment.duration).toEqual(2);
            expect(equipment.name).toEqual("Test");
            expect(equipment.permanent_effects).toEqual([]);
            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.target_effects).toEqual([new DamageEffect(20)]);

            equipment = template.generateFixed(1);
            expect(equipment.action).toEqual(new DeployDroneAction(equipment));
            expect(equipment.ap_usage).toEqual(5);
            expect(equipment.blast).toEqual(100);
            expect(equipment.code).toEqual("test");
            expect(equipment.distance).toEqual(200);
            expect(equipment.duration).toEqual(3);
            expect(equipment.name).toEqual("Test");
            expect(equipment.permanent_effects).toEqual([]);
            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.target_effects).toEqual([new DamageEffect(30)]);
        });
    });
}

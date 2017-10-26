/// <reference path="effects/BaseEffect.ts" />

module TK.SpaceTac.Specs {
    class FakeEffect extends BaseEffect {
        fakevalue: number
        constructor(val = 5) {
            super("fake");
            this.fakevalue = val;
        }
    }

    testing("LootTemplate", test => {
        test.case("generates equipment with correct information", check => {
            let template = new LootTemplate(SlotType.Power, "Power Generator", "A great power generator !");
            let result = template.generate(2, EquipmentQuality.PREMIUM);

            check.equals(result.slot_type, SlotType.Power);
            check.equals(result.code, "powergenerator");
            check.equals(result.name, "Power Generator");
            check.equals(result.price, 350);
            check.equals(result.level, 2);
            check.equals(result.quality, EquipmentQuality.COMMON);
            check.equals(result.description, "A great power generator !");

            template.addAttributeEffect("power_capacity", istep(10));
            result = template.generate(1, EquipmentQuality.COMMON);
            check.equals(result.quality, EquipmentQuality.COMMON);
            check.equals(result.effects, [new AttributeEffect("power_capacity", 10)]);
            result = template.generate(1, EquipmentQuality.PREMIUM);
            check.equals(result.quality, EquipmentQuality.PREMIUM);
            check.equals(result.effects, [new AttributeEffect("power_capacity", 13)]);
        });

        test.case("applies requirements on skills", check => {
            let template = new LootTemplate(SlotType.Hull, "Hull");
            template.setSkillsRequirements({ "skill_photons": istep(1), "skill_gravity": istep(2, istep(1)) });

            let result = template.generate(1);
            check.equals(result.requirements, {
                "skill_photons": 1,
                "skill_gravity": 2
            });

            result = template.generate(2);
            check.equals(result.requirements, {
                "skill_photons": 2,
                "skill_gravity": 3
            });

            result = template.generate(10);
            check.equals(result.requirements, {
                "skill_photons": 10,
                "skill_gravity": 47
            });
        });

        test.case("applies cooldown", check => {
            let template = new LootTemplate(SlotType.Weapon, "Weapon");
            template.setCooldown(istep(1), istep(2));

            let result = template.generate(1);
            check.equals(result.cooldown.overheat, 1);
            check.equals(result.cooldown.cooling, 2);

            result = template.generate(2);
            check.equals(result.cooldown.overheat, 2);
            check.equals(result.cooldown.cooling, 3);

            result = template.generate(10);
            check.equals(result.cooldown.overheat, 10);
            check.equals(result.cooldown.cooling, 11);
        });

        test.case("applies attributes permenant effects", check => {
            let template = new LootTemplate(SlotType.Shield, "Shield");
            template.addAttributeEffect("shield_capacity", irange(undefined, 50, 10));

            let result = template.generate(1);
            check.equals(result.effects, [new AttributeEffect("shield_capacity", 50)]);

            result = template.generate(2);
            check.equals(result.effects, [new AttributeEffect("shield_capacity", 60)]);
        });

        test.case("adds move actions", check => {
            let template = new LootTemplate(SlotType.Engine, "Engine");
            template.addMoveAction(irange(undefined, 100, 10), istep(50, irepeat(10)), irepeat(95));

            let result = template.generate(1);
            check.equals(result.action, new MoveAction(result, 100, 50, 95));

            result = template.generate(2);
            check.equals(result.action, new MoveAction(result, 110, 60, 95));
        });

        test.case("adds fire actions", check => {
            let template = new LootTemplate(SlotType.Weapon, "Weapon");
            template.addTriggerAction(istep(1), [
                new EffectTemplate(new FakeEffect(3), { "fakevalue": istep(8) })
            ], istep(100), istep(50), istep(10));

            let result = template.generate(1);
            check.equals(result.action, new TriggerAction(result, [new FakeEffect(8)], 1, 100, 50, 10));

            result = template.generate(2);
            check.equals(result.action, new TriggerAction(result, [new FakeEffect(9)], 2, 101, 51, 11));
        });

        test.case("adds drone actions", check => {
            let template = new LootTemplate(SlotType.Weapon, "Weapon");
            template.addDroneAction(istep(1), istep(100), istep(2), istep(50), [
                new EffectTemplate(new FakeEffect(3), { "fakevalue": istep(8) })
            ]);

            let result = template.generate(1);
            check.equals(result.action, new DeployDroneAction(result, 1, 100, 2, 50, [new FakeEffect(8)]));

            result = template.generate(2);
            check.equals(result.action, new DeployDroneAction(result, 2, 101, 3, 51, [new FakeEffect(9)]));
        });

        test.case("checks the presence of damaging effects", check => {
            let template = new LootTemplate(SlotType.Weapon, "Weapon");
            check.equals(template.hasDamageEffect(), false);

            template.addAttributeEffect("maneuvrability", irepeat(1));
            check.equals(template.hasDamageEffect(), false);

            template.addTriggerAction(irepeat(1), [new EffectTemplate(new BaseEffect("test"), {})], irepeat(50), irepeat(50));
            check.equals(template.hasDamageEffect(), false);

            template.addTriggerAction(irepeat(1), [new EffectTemplate(new DamageEffect(20), {})], irepeat(50), irepeat(50));
            check.equals(template.hasDamageEffect(), true);
        });
    });
}

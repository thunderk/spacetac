/// <reference path="effects/BaseEffect.ts" />

module TK.SpaceTac.Specs {
    class FakeEffect extends BaseEffect {
        fakevalue: number
        constructor(val = 5) {
            super("fake");
            this.fakevalue = val;
        }
    }

    function strip<T>(obj: T, attr: keyof T): any {
        let result: any = {};
        copyfields(obj, result);
        delete result[attr];
        return result;
    }

    function strip_id(effect: RObject): any {
        if (effect instanceof StickyEffect) {
            let result = strip(effect, "id");
            result.base = strip_id(result.base);
            return result;
        } else {
            return strip(effect, "id");
        }
    }

    export function compare_effects(check: TestContext, effects1: BaseEffect[], effects2: BaseEffect[]): void {
        check.equals(effects1.map(strip_id), effects2.map(strip_id), "effects");
    }

    export function compare_action(check: TestContext, action1: BaseAction | null, action2: BaseAction | null): void {
        if (action1 === null || action2 === null) {
            check.equals(action1, action2, "action");
        } else {
            check.equals(strip_id(action1), strip_id(action2), "action");
        }
    }

    export function compare_trigger_action(check: TestContext, action1: BaseAction | null, action2: TriggerAction | null): void {
        if (action1 === null || action2 === null || !(action1 instanceof TriggerAction)) {
            check.equals(action1, action2, "action");
        } else {
            check.equals(strip_id(strip(action1, "effects")), strip_id(strip(action2, "effects")), "action");
            compare_effects(check, action1.effects, action2.effects);
        }
    }

    export function compare_toggle_action(check: TestContext, action1: BaseAction | null, action2: ToggleAction | null): void {
        if (action1 === null || action2 === null || !(action1 instanceof ToggleAction)) {
            check.equals(action1, action2, "action");
        } else {
            check.equals(strip_id(strip(action1, "effects")), strip_id(strip(action2, "effects")), "action");
            compare_effects(check, action1.effects, action2.effects);
        }
    }

    export function compare_drone_action(check: TestContext, action1: BaseAction | null, action2: DeployDroneAction | null): void {
        if (action1 === null || action2 === null || !(action1 instanceof DeployDroneAction)) {
            check.equals(action1, action2, "action");
        } else {
            check.equals(strip_id(strip(action1, "drone_effects")), strip_id(strip(action2, "drone_effects")), "action");
            compare_effects(check, action1.drone_effects, action2.drone_effects);
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
            compare_effects(check, result.effects, [new AttributeEffect("power_capacity", 10)]);
            result = template.generate(1, EquipmentQuality.PREMIUM);
            check.equals(result.quality, EquipmentQuality.PREMIUM);
            compare_effects(check, result.effects, [new AttributeEffect("power_capacity", 13)]);
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
            compare_effects(check, result.effects, [new AttributeEffect("shield_capacity", 50)]);

            result = template.generate(2);
            compare_effects(check, result.effects, [new AttributeEffect("shield_capacity", 60)]);
        });

        test.case("adds move actions", check => {
            let template = new LootTemplate(SlotType.Engine, "Engine");
            template.addMoveAction(irange(undefined, 100, 10), istep(50, irepeat(10)), irepeat(95));

            let result = template.generate(1);
            compare_action(check, result.action, new MoveAction(result, 100, 50, 95));

            result = template.generate(2);
            compare_action(check, result.action, new MoveAction(result, 110, 60, 95));
        });

        test.case("adds fire actions", check => {
            let template = new LootTemplate(SlotType.Weapon, "Weapon");
            template.addTriggerAction(istep(1), [
                new EffectTemplate(new FakeEffect(3), { "fakevalue": istep(8) })
            ], istep(100), istep(50), istep(10));

            let result = template.generate(1);
            compare_trigger_action(check, result.action, new TriggerAction(result, [new FakeEffect(8)], 1, 100, 50, 10));

            result = template.generate(2);
            compare_trigger_action(check, result.action, new TriggerAction(result, [new FakeEffect(9)], 2, 101, 51, 11));
        });

        test.case("adds drone actions", check => {
            let template = new LootTemplate(SlotType.Weapon, "Weapon");
            template.addDroneAction(istep(1), istep(100), istep(50), [
                new EffectTemplate(new FakeEffect(3), { "fakevalue": istep(8) })
            ]);

            let result = template.generate(1);
            compare_drone_action(check, result.action, new DeployDroneAction(result, 1, 100, 50, [new FakeEffect(8)]));

            result = template.generate(2);
            compare_drone_action(check, result.action, new DeployDroneAction(result, 2, 101, 51, [new FakeEffect(9)]));
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

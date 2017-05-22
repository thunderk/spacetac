/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class SubMunitionMissile extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "SubMunition Missile", "Explosive missile releasing small shelled payloads, that will in turn explode on impact");

            this.setSkillsRequirements({ "skill_material": 1 });
            this.setCooldown(irepeat(1), 0);
            this.addFireAction(irepeat(4), istep(500, irepeat(20)), istep(150, irepeat(5)), [
                new EffectTemplate(new DamageEffect(), { base: istep(30, irepeat(2)), span: istep(2, irepeat(1)) })
            ]);
        }
    }
}

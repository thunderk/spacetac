/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class SubMunitionMissile extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "SubMunition Missile");

            this.setSkillsRequirements({ "skill_material": 1 });
            this.addFireAction(irepeat(4), istep(500, irepeat(20)), istep(150, irepeat(5)), [
                new EffectTemplate(new DamageEffect(), { "value": istep(30, irepeat(2)) })
            ]);
        }
    }
}

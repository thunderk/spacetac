/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class DamageProtector extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Damage Protector", "Extend a time-displacement subfield, to reduce damage taken by ships around");

            this.setSkillsRequirements({ "skill_time": istep(1, irepeat(2)) });
            this.addToggleAction(istep(2, irepeat(0.2)), istep(300, irepeat(10)), [
                new EffectTemplate(new DamageModifierEffect(), { factor: istep(-30, irepeat(-1)) })
            ]);
        }
    }
}

/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class DamageProtector extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Damage Protector", "Extend a time-displacement subfield, to reduce damage taken by ships around", 145);

            this.setSkillsRequirements({ "skill_time": leveled(3) });
            this.addToggleAction(leveled(2, 0.4), leveled(300, 10), [
                new EffectTemplate(new DamageModifierEffect(), { factor: imap(leveled(-20), x => x * (100 / (100 - x))) })
            ]);
        }
    }
}

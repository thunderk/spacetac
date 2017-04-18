/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class PowerDepleter extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Power Depleter");

            this.setSkillsRequirements({ "skill_energy": 1 });
            this.addFireAction(irepeat(4), istep(500, irepeat(20)), 0, [
                new StickyEffectTemplate(new AttributeLimitEffect("power_capacity"), { "value": irepeat(3) }, irepeat(2))
            ]);
        }
    }
}

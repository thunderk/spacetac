/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class PowerDepleter extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Power Depleter", "Direct-hit weapon that creates an antimatter well near the target, sucking its power surplus");

            this.setSkillsRequirements({ "skill_antimatter": leveled(1, 1.5) });
            this.setCooldown(irepeat(2), irepeat(3));
            this.addFireAction(irepeat(4), leveled(460, 30), irepeat(0), [
                new StickyEffectTemplate(new AttributeLimitEffect("power_capacity"), { "value": irepeat(3) }, irepeat(2))
            ]);
        }
    }
}

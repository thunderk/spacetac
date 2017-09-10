/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class ShieldTransfer extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Shield Transfer", "Generates small gravity wells between the ship's and the target's shields, stealing physical properties and energy");

            this.setSkillsRequirements({ "skill_gravity": 1 });
            this.setCooldown(irepeat(3), irepeat(3));
            this.addFireAction(irepeat(3), 0, istep(250, irepeat(20)), [
                new EffectTemplate(new ValueTransferEffect("shield"), { "amount": istep(-40, irepeat(-4)) })
            ]);
        }
    }
}

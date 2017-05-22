/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class GatlingGun extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Gatling Gun", "Mechanical weapon using loads of metal bullets propelled by guided explosions");

            this.setSkillsRequirements({ "skill_material": 1 });
            this.setCooldown(irepeat(2), irepeat(2));
            this.addFireAction(irepeat(3), irepeat(600), 0, [
                new EffectTemplate(new DamageEffect(), { base: istep(30, irepeat(5)), span: istep(20, irepeat(5)) })
            ]);
        }
    }
}

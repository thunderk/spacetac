/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class GatlingGun extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Gatling Gun", "Mechanical weapon using loads of metal bullets propelled by guided explosions");

            this.setSkillsRequirements({ "skill_material": 1 });
            this.addFireAction(irepeat(3), irepeat(600), 0, [
                new EffectTemplate(new DamageEffect(), { "value": istep(50, irepeat(10)) })
            ]);
        }
    }
}

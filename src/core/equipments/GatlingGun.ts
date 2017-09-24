/// <reference path="../LootTemplate.ts"/>

module TK.SpaceTac.Equipments {
    export class GatlingGun extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Gatling Gun", "Mechanical weapon using loads of metal bullets propelled by guided explosions");

            this.setSkillsRequirements({ "skill_materials": leveled(1, 1.4) });
            this.setCooldown(irepeat(2), irepeat(2));
            this.addFireAction(irepeat(3), leveled(500, 12), irepeat(0), [
                new EffectTemplate(new DamageEffect(), { base: leveled(30), span: leveled(20) })
            ]);
        }
    }
}

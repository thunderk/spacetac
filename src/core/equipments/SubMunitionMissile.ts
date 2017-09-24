/// <reference path="../LootTemplate.ts"/>

module TK.SpaceTac.Equipments {
    export class SubMunitionMissile extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "SubMunition Missile", "Explosive missile releasing small shelled payloads, that will in turn explode on impact", 163);

            this.setSkillsRequirements({ "skill_materials": leveled(1, 1.2), "skill_photons": leveled(1, 0.8) });
            this.setCooldown(irepeat(1), irepeat(0));
            this.addFireAction(irepeat(4), leveled(500, 20), leveled(150, 5), [
                new EffectTemplate(new DamageEffect(), { base: leveled(26, 2), span: leveled(4, 1) })
            ]);
        }
    }
}

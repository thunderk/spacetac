/// <reference path="../LootTemplate.ts"/>

module TK.SpaceTac.Equipments {
    export class NuclearReactor extends LootTemplate {
        constructor() {
            super(SlotType.Power, "Nuclear Reactor", "A standard nuclear power core, drawing power from atom fusion cycles", 395);

            this.setSkillsRequirements({ "skill_photons": leveled(1, 2) });
            this.addAttributeEffect("maneuvrability", leveled(1, 1, 0));
            this.addAttributeEffect("power_capacity", leveled(7, 0.5));
            this.addAttributeEffect("power_generation", leveled(4.5, 0.5));
        }
    }

    export class KelvinGenerator extends LootTemplate {
        constructor() {
            super(SlotType.Power, "Kelvin Generator", "A power generator operating at ultra-low temperature, improving equipment cooldown", 420);

            this.setSkillsRequirements({ "skill_time": leveled(1, 1.7), "skill_gravity": leveled(0.3, 0.4) });
            this.addAttributeEffect("power_capacity", leveled(5.5, 0.5));
            this.addAttributeEffect("power_generation", leveled(4, 0.5));
            this.addTriggerAction(leveled(1, 0.4), [
                new EffectTemplate(new CooldownEffect(), { cooling: leveled(1, 0.2), maxcount: leveled(1, 0.4) })
            ])
        }
    }
}

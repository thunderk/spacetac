/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class NuclearReactor extends LootTemplate {
        constructor() {
            super(SlotType.Power, "Nuclear Reactor", "A standard nuclear power core, drawing power from atom fusion cycles", 395);

            this.setSkillsRequirements({ "skill_photons": leveled(1, 2) });
            this.addAttributeEffect("maneuvrability", leveled(1, 1, 0));
            this.addAttributeEffect("power_capacity", leveled(7, 0.5));
            this.addAttributeEffect("power_generation", leveled(4.5, 0.5));
        }
    }
}

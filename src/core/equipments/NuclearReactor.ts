/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class NuclearReactor extends LootTemplate {
        constructor() {
            super(SlotType.Power, "Nuclear Reactor", "A standard nuclear power core, drawing power from atom fusion cycles");

            this.setSkillsRequirements({ "skill_photons": 1 });
            this.addAttributeEffect("maneuvrability", istep(1));
            this.addAttributeEffect("power_capacity", istep(7));
            this.addAttributeEffect("power_generation", istep(4, irepeat(0.3)));
        }
    }
}

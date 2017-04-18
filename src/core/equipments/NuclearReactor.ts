/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class NuclearReactor extends LootTemplate {
        constructor() {
            super(SlotType.Power, "Nuclear Reactor", "A standard nuclear power core, drawing power from atom fusion cycles");

            this.setSkillsRequirements({ "skill_energy": 1 });
            this.addAttributeEffect("initiative", istep(1));
            this.addAttributeEffect("power_capacity", istep(6));
            this.addAttributeEffect("power_initial", istep(4, irepeat(0.5)));
            this.addAttributeEffect("power_recovery", istep(3, irepeat(0.3)));
        }
    }
}

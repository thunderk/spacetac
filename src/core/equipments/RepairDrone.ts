/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    /**
     * Drone that repairs damage done to the hull.
     */
    export class RepairDrone extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Repair Drone");

            this.setSkillsRequirements({ "skill_human": 1 });
            this.addDroneAction(irepeat(4), istep(300, irepeat(10)), istep(1, irepeat(0.2)), istep(100, irepeat(10)), [
                new EffectTemplate(new ValueEffect("hull"), { "value": istep(30, irepeat(3)) })
            ]);
        }
    }
}
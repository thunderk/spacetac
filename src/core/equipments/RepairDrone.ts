/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    /**
     * Drone that repairs damage done to the hull.
     */
    export class RepairDrone extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Repair Drone", "Drone able to repair small hull breaches, remotely controlled by human pilots");

            this.setSkillsRequirements({ "skill_human": 1 });
            this.setCooldown(irepeat(1), istep(3, irepeat(0.2)));
            this.addDroneAction(irepeat(4), istep(300, irepeat(10)), istep(1, irepeat(0.2)), istep(100, irepeat(10)), [
                new EffectTemplate(new ValueEffect("hull"), { "value": istep(30, irepeat(3)) })
            ]);
        }
    }
}
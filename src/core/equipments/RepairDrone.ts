/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    /**
     * Drone that repairs damage done to the hull.
     */
    export class RepairDrone extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Repair Drone", "Drone able to repair small hull breaches, using quantum patches", 190);

            this.setSkillsRequirements({ "skill_quantum": leveled(1, 3) });
            this.setCooldown(irepeat(1), leveled(3));
            this.addDroneAction(leveled(4, 0.4), leveled(300, 10), leveled(10, 1), leveled(150, 5), [
                new EffectTemplate(new ValueEffect("hull"), { "value": istep(2) })
            ]);
        }
    }
}
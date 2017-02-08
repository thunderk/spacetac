/// <reference path="AbstractDrone.ts"/>

module TS.SpaceTac.Game.Equipments {
    /**
     * Drone that repairs damage done to the hull.
     */
    export class RepairDrone extends AbstractDrone {
        constructor() {
            super("Repair Drone");

            this.min_level = new IntegerRange(1, 4);

            this.setLifetime(1, 1);
            this.setDeployDistance(50, 100);
            this.setEffectRadius(40, 80);
            this.setPowerConsumption(4, 5);

            this.addValueEffectOnTarget("hull", 10, 20);
        }
    }
}
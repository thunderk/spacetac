/// <reference path="AbstractDrone.ts"/>

module TS.SpaceTac.Equipments {
    /**
     * Drone that repairs damage done to the hull.
     */
    export class RepairDrone extends AbstractDrone {
        constructor() {
            super("Repair Drone");

            this.min_level = new IntegerRange(1, 4);

            this.setLifetime(1, 2);
            this.setDeployDistance(150, 200);
            this.setEffectRadius(60, 180);
            this.setPowerConsumption(4, 5);

            this.addEffect(new ValueEffect("hull"), 30, 60);
        }
    }
}
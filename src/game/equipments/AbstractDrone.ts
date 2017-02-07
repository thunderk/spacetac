/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Game.Equipments {
    /**
     * Base class for all weapon equipment that deploys a drone.
     */
    export class AbstractDrone extends LootTemplate {
        constructor(name: string) {
            super(SlotType.Weapon, name);
        }

        /**
         * Set the maximal distance at which the drone may be deployed
         * 
         * Be aware that *min_distance* means the MAXIMAL reachable distance, but on a low-power loot !
         */
        setDeployDistance(min_distance: number, max_distance: number = null): void {
            this.distance = new Range(min_distance, max_distance);
        }

        /**
         * Set the effect radius of the deployed drone
         */
        setEffectRadius(min_radius: number, max_radius: number = null): void {
            this.blast = new IntegerRange(min_radius, max_radius);
        }

        /**
         * Set the drone lifetime
         */
        setLifetime(min_lifetime: number, max_lifetime: number = null): void {
            this.duration = new IntegerRange(min_lifetime, max_lifetime);
        }

        protected getActionForEquipment(equipment: Equipment): BaseAction {
            var result = new DeployDroneAction(equipment);
            return result;
        }
    }
}
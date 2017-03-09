/// <reference path="BaseAction.ts"/>

module TS.SpaceTac {
    /**
     * Action to deploy a drone in space
     */
    export class DeployDroneAction extends BaseAction {
        equipment: Equipment;

        constructor(equipment: Equipment) {
            super("deploy-" + equipment.code, "Deploy", true, equipment);
        }

        checkLocationTarget(ship: Ship, target: Target): Target {
            // TODO Not too close to other ships and drones
            target = target.constraintInRange(ship.arena_x, ship.arena_y, this.equipment.distance);
            return target;
        }

        protected customApply(ship: Ship, target: Target) {
            let drone = new Drone(ship, this.equipment.code);
            drone.x = target.x;
            drone.y = target.y;
            drone.radius = this.equipment.blast;
            drone.effects = this.equipment.target_effects;
            drone.duration = this.equipment.duration;

            let battle = ship.getBattle();
            if (battle) {
                battle.addDrone(drone);
            }
        }
    }
}

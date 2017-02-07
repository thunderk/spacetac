/// <reference path="BaseAction.ts"/>

module TS.SpaceTac.Game {
    /**
     * Action to deploy a drone in space
     */
    export class DeployDroneAction extends BaseAction {
        constructor(equipment: Equipment) {
            super("deploy-" + equipment.code, "Deploy", true, equipment);
        }

        checkLocationTarget(battle: Battle, ship: Ship, target: Target): Target {
            // TODO Not too close to other ships and drones
            target = target.constraintInRange(ship.arena_x, ship.arena_y, this.equipment.distance);
            return target;
        }

        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            let drone = new Drone(ship);
            drone.x = target.x;
            drone.y = target.y;
            drone.radius = this.equipment.blast;
            drone.effects = this.equipment.target_effects;
            drone.duration = this.equipment.duration;
            battle.addDrone(drone);
            return true;
        }
    }
}
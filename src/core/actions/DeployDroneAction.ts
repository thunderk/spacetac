/// <reference path="ToggleAction.ts"/>

module TK.SpaceTac {
    /**
     * Action to deploy a drone in space
     * 
     * This is a toggled action, meaning that deploying a drone requires a permanent power supply from the ship
     */
    export class DeployDroneAction extends ToggleAction {
        // Maximal distance the drone may be deployed
        deploy_distance: number

        // Effect radius of the deployed drone
        drone_radius: number

        // Effects applied to ships in range of the drone
        drone_effects: BaseEffect[]

        constructor(equipment: Equipment, power = 1, deploy_distance = 0, radius = 0, effects: BaseEffect[] = []) {
            super(equipment, power, 0, [], `deploy-${equipment.code}`);

            this.deploy_distance = deploy_distance;
            this.drone_radius = radius;
            this.drone_effects = effects;
        }

        getVerb(): string {
            return this.activated ? "Recall" : "Deploy";
        }

        getTargettingMode(ship: Ship): ActionTargettingMode {
            return this.activated ? ActionTargettingMode.SELF : ActionTargettingMode.SPACE;
        }

        getRangeRadius(ship: Ship): number {
            return this.activated ? 0 : this.deploy_distance;
        }

        filterImpactedShips(source: ArenaLocation, target: Target, ships: Ship[]): Ship[] {
            return ships.filter(ship => arenaDistance(ship.location, target) <= this.drone_radius);
        }

        checkLocationTarget(ship: Ship, target: Target): Target {
            target = target.constraintInRange(ship.arena_x, ship.arena_y, this.deploy_distance);
            return target;
        }

        protected getSpecificDiffs(ship: Ship, battle: Battle, target: Target): BaseBattleDiff[] {
            let result = super.getSpecificDiffs(ship, battle, target);

            if (this.activated) {
                let drone = first(battle.drones.list(), drone => drone.parent == this);
                if (drone) {
                    result.push(new DroneRecalledDiff(drone));
                } else {
                    return [];
                }
            } else {
                let drone = new Drone(ship, this.equipment.code);
                drone.parent = this;
                drone.x = target.x;
                drone.y = target.y;
                drone.radius = this.drone_radius;
                drone.effects = this.drone_effects;

                result.push(new DroneDeployedDiff(drone));
            }

            return result;
        }

        getEffectsDescription(): string {
            let desc = `Deploy drone (power usage ${this.power}, max range ${this.deploy_distance}km)`;
            let effects = this.drone_effects.map(effect => {
                let suffix = `for ships in ${this.drone_radius}km radius`;
                return "• " + effect.getDescription() + " " + suffix;
            });
            return `${desc}:\n${effects.join("\n")}`;
        }
    }
}

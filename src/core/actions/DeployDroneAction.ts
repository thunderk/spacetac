/// <reference path="ToggleAction.ts"/>

module TK.SpaceTac {
    /** 
     * Configuration of a drone deployment action
     */
    export interface DeployDroneActionConfig {
        // Maximal distance the drone may be deployed
        deploy_distance: number

        // Effect radius of the deployed drone
        drone_radius: number

        // Effects applied to ships in range of the drone
        drone_effects: BaseEffect[]
    }

    /**
     * Action to deploy a drone in space
     * 
     * This is a toggled action, meaning that deploying a drone requires a permanent power supply from the ship
     */
    export class DeployDroneAction extends ToggleAction implements DeployDroneActionConfig {
        deploy_distance = 0
        drone_radius = 0
        drone_effects: BaseEffect[] = []

        constructor(name: string, toggle_config?: Partial<ToggleActionConfig>, drone_config?: Partial<DeployDroneActionConfig>, code?: string) {
            super(name, toggle_config, code);

            if (drone_config) {
                this.configureDrone(drone_config);
            }
        }

        /**
         * Configure the deployed drone
         */
        configureDrone(config: Partial<DeployDroneActionConfig>): void {
            copyfields(config, this);
        }

        getVerb(ship: Ship): string {
            return ship.actions.isToggled(this) ? "Recall" : "Deploy";
        }

        getTargettingMode(ship: Ship): ActionTargettingMode {
            return ship.actions.isToggled(this) ? ActionTargettingMode.SELF : ActionTargettingMode.SPACE;
        }

        getDefaultTarget(ship: Ship): Target {
            let harmful = any(this.effects, effect => !effect.isBeneficial());
            let distance = this.drone_radius * (harmful ? 1.1 : 0.9);
            return Target.newFromLocation(
                ship.arena_x + Math.cos(ship.arena_angle) * distance,
                ship.arena_y + Math.sin(ship.arena_angle) * distance
            );
        }

        getRangeRadius(ship: Ship): number {
            return ship.actions.isToggled(this) ? 0 : this.deploy_distance;
        }

        filterImpactedShips(ship: Ship, source: ArenaLocation, target: Target, ships: Ship[]): Ship[] {
            let result = ships.filter(iship => arenaDistance(iship.location, target) <= this.radius);
            result = BaseAction.filterTargets(ship, result, this.filter);
            return result;
        }

        checkLocationTarget(ship: Ship, target: Target): Target {
            target = target.constraintInRange(ship.arena_x, ship.arena_y, this.deploy_distance);
            return target;
        }

        getSpecificDiffs(ship: Ship, battle: Battle, target: Target): BaseBattleDiff[] {
            let result = super.getSpecificDiffs(ship, battle, target);

            if (ship.actions.isToggled(this)) {
                let drone = first(battle.drones.list(), idrone => this.is(idrone.parent));
                if (drone) {
                    result.push(new DroneRecalledDiff(drone));
                } else {
                    return [];
                }
            } else {
                let drone = new Drone(ship, this.code);
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
            let suffix = `on ${BaseAction.getFilterDesc(this.filter)} in ${this.drone_radius}km radius`;
            let effects = this.drone_effects.map(effect => {
                return "• " + effect.getDescription() + " " + suffix;
            });
            return `${desc}:\n${effects.join("\n")}`;
        }
    }
}

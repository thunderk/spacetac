/// <reference path="BaseAction.ts"/>

module TS.SpaceTac {
    /**
     * Action to deploy a drone in space
     */
    export class DeployDroneAction extends BaseAction {
        // Power usage
        power: number;

        // Maximal distance the drone may be deployed
        deploy_distance: number;

        // Effect radius of the deployed drone
        effect_radius: number;

        // Duration of the drone in turns, before being destroyed
        lifetime: number;

        // Effects applied to ships in range of the drone
        effects: BaseEffect[];

        // Source equipment
        equipment: Equipment;

        constructor(equipment: Equipment, power = 1, deploy_distance = 0, lifetime = 0, effect_radius = 0, effects: BaseEffect[] = []) {
            super("deploy-" + equipment.code, "Deploy", equipment);

            this.power = power;
            this.deploy_distance = deploy_distance;
            this.lifetime = lifetime;
            this.effect_radius = effect_radius;
            this.effects = effects;
        }

        getActionPointsUsage(ship: Ship, target: Target | null): number {
            return this.power;
        }

        getRangeRadius(ship: Ship): number {
            return this.deploy_distance;
        }

        getBlastRadius(ship: Ship): number {
            return this.effect_radius;
        }

        checkLocationTarget(ship: Ship, target: Target): Target {
            // TODO Not too close to other ships and drones
            target = target.constraintInRange(ship.arena_x, ship.arena_y, this.deploy_distance);
            return target;
        }

        protected customApply(ship: Ship, target: Target) {
            let drone = new Drone(ship, this.equipment.code, this.lifetime);
            drone.x = target.x;
            drone.y = target.y;
            drone.radius = this.effect_radius;
            drone.effects = this.effects;

            let battle = ship.getBattle();
            if (battle) {
                battle.addDrone(drone);
            }
        }

        getEffectsDescription(): string {
            let desc = `Deploy drone for ${this.lifetime} activation${this.lifetime > 1 ? "s" : ""} (power usage ${this.power}, max range ${this.deploy_distance}km)`;
            let effects = this.effects.map(effect => {
                let suffix = `for ships in ${this.effect_radius}km radius`;
                return "• " + effect.getDescription() + " " + suffix;
            });
            return `${desc}:\n${effects.join("\n")}`;
        }
    }
}

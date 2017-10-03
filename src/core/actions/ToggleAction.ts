/// <reference path="BaseAction.ts"/>

module TK.SpaceTac {
    /**
     * Action to toggle some effects on the ship or around it, until next turn start
     */
    export class ToggleAction extends BaseAction {
        // Power consumption (activation only)
        power: number

        // Effect radius
        radius: number

        // Effects applied
        effects: BaseEffect[]

        // Equipment cannot be null
        equipment: Equipment

        // Current activation status
        activated = false

        constructor(equipment: Equipment, power = 1, radius = 0, effects: BaseEffect[] = [], name = "(De)activate") {
            super("toggle-" + equipment.code, name, equipment);

            this.power = power;
            this.radius = radius;
            this.effects = effects;
        }

        getTargettingMode(ship: Ship): ActionTargettingMode {
            if (this.activated || !this.radius) {
                return ActionTargettingMode.SELF_CONFIRM;
            } else {
                return ActionTargettingMode.SURROUNDINGS;
            }
        }

        getActionPointsUsage(ship: Ship, target: Target | null): number {
            return this.activated ? 0 : this.power;
        }

        getRangeRadius(ship: Ship): number {
            return 0;
        }

        filterImpactedShips(source: ArenaLocation, target: Target, ships: Ship[]): Ship[] {
            return ships.filter(ship => arenaDistance(ship.location, source) <= this.radius);
        }

        checkShipTarget(ship: Ship, target: Target): Target | null {
            return (ship == target.ship) ? target : null;
        }

        /**
         * Collect the effects applied by this action
         */
        getEffects(ship: Ship, target: Target, source = ship.location): [Ship, BaseEffect][] {
            let result: [Ship, BaseEffect][] = [];
            let ships = this.getImpactedShips(ship, target, source);
            ships.forEach(ship => {
                this.effects.forEach(effect => result.push([ship, effect]));
            });
            return result;
        }

        protected customApply(ship: Ship, target: Target) {
            this.activated = !this.activated;
            ship.addBattleEvent(new ToggleEvent(ship, this, this.activated));
            this.getImpactedShips(ship, target).forEach(iship => iship.setActiveEffectsChanged());
        }

        getEffectsDescription(): string {
            if (this.effects.length == 0) {
                return "";
            }

            let desc = `When active (power usage ${this.power})`;
            let effects = this.effects.map(effect => {
                let suffix = this.radius ? `in ${this.radius}km radius` : "on owner ship";
                return "• " + effect.getDescription() + " " + suffix;
            });
            return `${desc}:\n${effects.join("\n")}`;
        }
    }
}

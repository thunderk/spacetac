/// <reference path="BaseAction.ts"/>

module TS.SpaceTac {
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
            super("toggle-" + equipment.code, name, false, equipment);

            this.power = power;
            this.radius = radius;
            this.effects = effects;
        }

        getActionPointsUsage(ship: Ship, target: Target | null): number {
            return this.activated ? 0 : this.power;
        }

        getRangeRadius(ship: Ship): number {
            return 0;
        }

        getBlastRadius(ship: Ship): number {
            return this.radius;
        }

        /**
         * Get the list of ships in range to be affected
         */
        getAffectedShips(ship: Ship): Ship[] {
            let target = Target.newFromShip(ship);
            let radius = this.getBlastRadius(ship);
            let battle = ship.getBattle();
            return (radius && battle) ? battle.collectShipsInCircle(target, radius, true) : ((target.ship && target.ship.alive) ? [target.ship] : []);
        }

        /**
         * Collect the effects applied by this action
         */
        getEffects(ship: Ship): [Ship, BaseEffect][] {
            let result: [Ship, BaseEffect][] = [];
            let ships = this.getAffectedShips(ship);
            ships.forEach(ship => {
                this.effects.forEach(effect => result.push([ship, effect]));
            });
            return result;
        }

        protected customApply(ship: Ship, target: Target) {
            this.activated = !this.activated;
            ship.addBattleEvent(new ToggleEvent(ship, this, this.activated));
            this.getAffectedShips(ship).forEach(iship => iship.setActiveEffectsChanged());
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

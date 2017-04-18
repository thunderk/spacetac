/// <reference path="BaseAction.ts"/>

module TS.SpaceTac {
    /**
     * Action to fire a weapon on another ship, or in space
     */
    export class FireWeaponAction extends BaseAction {
        // Power consumption
        power: number;

        // Maximal range of the weapon
        range: number

        // Blast radius
        blast: number;

        // Effects applied on hit
        effects: BaseEffect[];

        // Equipment cannot be null
        equipment: Equipment;

        constructor(equipment: Equipment, power = 1, range = 0, blast = 0, effects: BaseEffect[] = [], name = "Fire") {
            super("fire-" + equipment.code, name, true, equipment);

            this.power = power;
            this.range = range;
            this.effects = effects;
            this.blast = blast;
        }

        getActionPointsUsage(ship: Ship, target: Target | null): number {
            return this.power;
        }

        getRangeRadius(ship: Ship): number {
            return this.range;
        }

        getBlastRadius(ship: Ship): number {
            return this.blast;
        }

        checkLocationTarget(ship: Ship, target: Target): Target | null {
            if (target && this.blast > 0) {
                target = target.constraintInRange(ship.arena_x, ship.arena_y, this.range);
                return target;
            } else {
                return null;
            }
        }

        checkShipTarget(ship: Ship, target: Target): Target | null {
            if (target.ship && ship.getPlayer() === target.ship.getPlayer()) {
                // No friendly fire
                return null;
            } else {
                // Check if target is in range
                if (this.blast > 0) {
                    return this.checkLocationTarget(ship, new Target(target.x, target.y));
                } else if (target.isInRange(ship.arena_x, ship.arena_y, this.range)) {
                    return target;
                } else {
                    return null;
                }
            }
        }

        /**
         * Collect the effects applied by this action
         */
        getEffects(ship: Ship, target: Target): [Ship, BaseEffect][] {
            let result: [Ship, BaseEffect][] = [];
            let blast = this.getBlastRadius(ship);
            let battle = ship.getBattle();
            let ships = (blast && battle) ? battle.collectShipsInCircle(target, blast, true) : ((target.ship && target.ship.alive) ? [target.ship] : []);
            ships.forEach(ship => {
                this.effects.forEach(effect => result.push([ship, effect]));
            });
            return result;
        }

        protected customApply(ship: Ship, target: Target) {
            // Face the target
            ship.rotate(Target.newFromShip(ship).getAngleTo(target));

            // Fire event
            ship.addBattleEvent(new FireEvent(ship, this.equipment, target));

            // Apply effects
            let effects = this.getEffects(ship, target);
            effects.forEach(([ship, effect]) => effect.applyOnShip(ship));
        }

        getEffectsDescription(): string {
            if (this.effects.length == 0) {
                return "";
            }

            let desc = `${this.name} (power usage ${this.power}, max range ${this.range}km)`;
            let effects = this.effects.map(effect => {
                let suffix = this.blast ? `in ${this.blast}km radius` : "on target";
                if (effect instanceof StickyEffect) {
                    suffix = `for ${effect.duration} turn${effect.duration > 1 ? "s" : ""} ${suffix}`;
                }
                return "- " + effect.getDescription() + " " + suffix;
            });
            return `${desc}:\n${effects.join("\n")}`;
        }
    }
}

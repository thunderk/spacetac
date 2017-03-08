/// <reference path="BaseAction.ts"/>

module TS.SpaceTac {
    // Action to fire a weapon on another ship, or in space
    export class FireWeaponAction extends BaseAction {
        // Boolean set to true if the weapon can target space
        can_target_space: boolean;

        constructor(equipment: Equipment, can_target_space = false, name = "Fire") {
            super("fire-" + equipment.code, name, true, equipment);

            this.can_target_space = can_target_space;
        }

        checkLocationTarget(ship: Ship, target: Target): Target {
            if (this.can_target_space) {
                target = target.constraintInRange(ship.arena_x, ship.arena_y, this.equipment.distance);
                return target;
            } else {
                return null;
            }
        }

        checkShipTarget(ship: Ship, target: Target): Target {
            if (ship.getPlayer() === target.ship.getPlayer()) {
                // No friendly fire
                return null;
            } else {
                // Check if target is in range
                if (this.can_target_space) {
                    return this.checkLocationTarget(ship, new Target(target.x, target.y));
                } else if (target.isInRange(ship.arena_x, ship.arena_y, this.equipment.distance)) {
                    return target;
                } else {
                    return null;
                }
            }
        }

        /**
         * Collect the effects applied by this action
         */
        getEffects(battle: Battle, ship: Ship, target: Target): [Ship, BaseEffect][] {
            let result: [Ship, BaseEffect][] = [];
            let blast = this.getBlastRadius(ship);
            let ships = blast ? battle.collectShipsInCircle(target, blast, true) : ((target.ship && target.ship.alive) ? [target.ship] : []);
            ships.forEach(ship => {
                this.equipment.target_effects.forEach(effect => result.push([ship, effect]));
            });
            return result;
        }

        protected customApply(ship: Ship, target: Target) {
            // Face the target
            ship.rotate(Target.newFromShip(ship).getAngleTo(target));

            // Fire event
            ship.addBattleEvent(new FireEvent(ship, this.equipment, target));

            // Apply effects
            let effects = this.getEffects(ship.getBattle(), ship, target);
            effects.forEach(([ship, effect]) => effect.applyOnShip(ship));
        }
    }
}

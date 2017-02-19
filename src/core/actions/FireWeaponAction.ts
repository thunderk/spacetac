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

        checkLocationTarget(battle: Battle, ship: Ship, target: Target): Target {
            if (this.can_target_space) {
                target = target.constraintInRange(ship.arena_x, ship.arena_y, this.equipment.distance);
                return target;
            } else {
                return null;
            }
        }

        checkShipTarget(battle: Battle, ship: Ship, target: Target): Target {
            if (ship.getPlayer() === target.ship.getPlayer()) {
                // No friendly fire
                return null;
            } else {
                // Check if target is in range
                if (target.isInRange(ship.arena_x, ship.arena_y, this.equipment.distance)) {
                    return target;
                } else {
                    return null;
                }
            }
        }

        protected customApply(battle: Battle, ship: Ship, target: Target) {
            var affected: Ship[] = [];
            var blast = this.getBlastRadius(ship);

            // Face the target
            ship.rotate(Target.newFromShip(ship).getAngleTo(target));

            // Collect affected ships
            if (blast) {
                affected = affected.concat(battle.collectShipsInCircle(target, blast, true));
            } else if (target.ship && target.ship.alive) {
                affected.push(target.ship);
            }

            // Fire event
            ship.addBattleEvent(new FireEvent(ship, this.equipment, target));

            // Apply all target effects
            affected.forEach((affship: Ship) => {
                this.equipment.target_effects.forEach((effect: BaseEffect) => {
                    effect.applyOnShip(affship);
                });
            });
        }
    }
}

/// <reference path="BaseAction.ts"/>

module TS.SpaceTac {
    /**
     * Action to fire a weapon on another ship, or in space
     */
    export class FireWeaponAction extends BaseAction {
        // Power consumption
        power: number

        // Maximal range of the weapon
        range: number

        // Blast radius
        blast: number

        // Effects applied on target
        effects: BaseEffect[]

        // Equipment cannot be null
        equipment: Equipment

        constructor(equipment: Equipment, power = 1, range = 0, blast = 0, effects: BaseEffect[] = [], name = "Fire") {
            super("fire-" + equipment.code, name, equipment);

            this.power = power;
            this.range = range;
            this.effects = effects;
            this.blast = blast;
        }

        getDefaultTarget(ship: Ship): Target {
            if (this.range == 0) {
                return Target.newFromShip(ship);
            } else {
                let battle = ship.getBattle();
                if (battle) {
                    let harmful = any(this.effects, effect => !effect.isBeneficial());
                    let player = ship.getPlayer();
                    let ships = imaterialize(harmful ? battle.ienemies(player, true) : ifilter(battle.iallies(player, true), iship => iship != ship));
                    let nearest = minBy(ships, iship => arenaDistance(ship.location, iship.location));
                    return Target.newFromShip(nearest);
                } else {
                    return Target.newFromShip(ship);
                }
            }
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
            if (this.range > 0 && ship == target.ship) {
                // No self fire
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
            if (arenaDistance(ship.location, target) > 0.000001) {
                // Face the target
                ship.rotate(arenaAngle(ship.location, target), first(ship.listEquipment(SlotType.Engine), () => true));
            }

            // Fire event
            ship.addBattleEvent(new FireEvent(ship, this.equipment, target));

            // Apply effects
            let effects = this.getEffects(ship, target);
            effects.forEach(([ship_target, effect]) => effect.applyOnShip(ship_target, ship));
        }

        getEffectsDescription(): string {
            if (this.effects.length == 0) {
                return "";
            }

            let desc = `${this.name} (power usage ${this.power}, max range ${this.range}km)`;
            let effects = this.effects.map(effect => {
                let suffix = this.blast ? `in ${this.blast}km radius` : "on target";
                return "• " + effect.getDescription() + " " + suffix;
            });
            return `${desc}:\n${effects.join("\n")}`;
        }
    }
}

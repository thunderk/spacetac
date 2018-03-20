/// <reference path="BaseAction.ts"/>

module TK.SpaceTac {
    /** 
     * Configuration of a trigger action
     */
    export interface TriggerActionConfig {
        // Effects applied on target
        effects: BaseEffect[]
        // Power consumption
        power: number
        // Maximal range of the weapon (distance to target)
        range: number
        // Radius around the target that will be impacted
        blast: number
        // Angle of the area between the source and the target that will be impacted
        angle: number
    }

    /**
     * Action to trigger an equipment (for example a weapon), with an optional target
     * 
     * The target will be resolved as a list of ships, on which all the action effects will be applied
     */
    export class TriggerAction extends BaseAction implements TriggerActionConfig {
        effects: BaseEffect[] = []
        power = 1
        range = 0
        blast = 0
        angle = 0

        constructor(name?: string, config?: Partial<TriggerActionConfig>, code?: string) {
            super(name, code);

            if (config) {
                this.configureTrigger(config);
            }
        }

        /**
         * Configure the triggering and effects of this action
         */
        configureTrigger(config: Partial<TriggerActionConfig>) {
            copyfields(config, this);
        }

        getVerb(): string {
            return this.range ? "Fire" : "Trigger";
        }

        getDefaultTarget(ship: Ship): Target {
            if (this.range == 0) {
                return Target.newFromShip(ship);
            } else {
                let battle = ship.getBattle();
                if (battle) {
                    let harmful = any(this.effects, effect => !effect.isBeneficial());
                    let ships = imaterialize(harmful ? battle.ienemies(ship, true) : ifilter(battle.iallies(ship, true), iship => !iship.is(ship)));
                    let nearest = minBy(ships, iship => arenaDistance(ship.location, iship.location));
                    return Target.newFromShip(nearest);
                } else {
                    return Target.newFromShip(ship);
                }
            }
        }

        getTargettingMode(ship: Ship): ActionTargettingMode {
            if (this.blast) {
                if (this.range) {
                    return ActionTargettingMode.SPACE;
                } else {
                    return ActionTargettingMode.SURROUNDINGS;
                }
            } else if (this.range) {
                if (this.angle) {
                    return ActionTargettingMode.SPACE;
                } else {
                    return ActionTargettingMode.SHIP;
                }
            } else {
                return ActionTargettingMode.SELF_CONFIRM;
            }
        }

        getPowerUsage(ship: Ship, target: Target | null): number {
            return this.power;
        }

        getRangeRadius(ship: Ship): number {
            return this.range;
        }

        filterImpactedShips(source: ArenaLocation, target: Target, ships: Ship[]): Ship[] {
            if (this.blast) {
                return ships.filter(ship => arenaDistance(ship.location, target) <= this.blast);
            } else if (this.angle) {
                let angle = arenaAngle(source, target);
                let maxangle = (this.angle * 0.5) * Math.PI / 180;
                return ships.filter(ship => {
                    let dist = arenaDistance(source, ship.location);
                    if (dist < 0.000001 || dist > this.range) {
                        return false;
                    } else {
                        return Math.abs(angularDifference(arenaAngle(source, ship.location), angle)) < maxangle;
                    }
                });
            } else {
                return ships.filter(ship => ship.is(target.ship_id));
            }
        }

        checkLocationTarget(ship: Ship, target: Target): Target | null {
            if (target && (this.blast > 0 || this.angle > 0)) {
                target = target.constraintInRange(ship.arena_x, ship.arena_y, this.range);
                return target;
            } else {
                return null;
            }
        }

        checkShipTarget(ship: Ship, target: Target): Target | null {
            if (this.range > 0 && ship.is(target.ship_id)) {
                // No self fire
                return null;
            } else {
                // Check if target is in range
                if (this.blast > 0 || this.angle > 0) {
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
        getEffects(ship: Ship, target: Target, source = ship.location): [Ship, BaseEffect][] {
            let result: [Ship, BaseEffect][] = [];
            let ships = this.getImpactedShips(ship, target, source);
            ships.forEach(iship => {
                this.effects.forEach(effect => result.push([iship, effect]));
            });
            return result;
        }

        protected getSpecificDiffs(ship: Ship, battle: Battle, target: Target): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];

            if (arenaDistance(ship.location, target) > 1e-6) {
                // Face the target
                let angle = arenaAngle(ship.location, target);
                if (Math.abs(angularDifference(angle, ship.arena_angle)) > 1e-6) {
                    let destination = new ArenaLocationAngle(ship.arena_x, ship.arena_y, angle);
                    let engine = <MoveAction | null>first(ship.actions.listAll(), action => action instanceof MoveAction);
                    result.push(new ShipMoveDiff(ship, ship.location, destination, engine));
                }

                // Fire a projectile
                if (this.range) {
                    result.push(new ProjectileFiredDiff(ship, this, target));
                }
            }

            // Apply effects
            let effects = this.getEffects(ship, target);
            effects.forEach(([ship_target, effect]) => {
                let diffs = effect.getOnDiffs(ship_target, ship);
                result = result.concat(diffs);
            });

            return result;
        }

        getEffectsDescription(): string {
            if (this.effects.length == 0) {
                return "";
            }

            let info: string[] = [];
            if (this.power) {
                info.push(`power ${this.power}`);
            }
            if (this.range) {
                info.push(`range ${this.range}km`);
            }

            let desc = (info.length) ? `${this.getVerb()} (${info.join(", ")})` : this.getVerb();
            let effects = this.effects.map(effect => {
                let suffix: string;
                if (this.blast) {
                    suffix = `in ${this.blast}km radius`;
                } else if (this.angle) {
                    suffix = `in ${this.angle}° arc`;
                } else if (this.range) {
                    suffix = "on target";
                } else {
                    suffix = "on self";
                }
                return "• " + effect.getDescription() + " " + suffix;
            });
            return `${desc}:\n${effects.join("\n")}`;
        }
    }
}

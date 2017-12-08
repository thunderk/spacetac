/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Wrapper around another effect, to make it stick to a ship for a given number of turns.
     * 
     * The "effect" is to stick the wrapped effect to the ship.
     */
    export class StickyEffect extends BaseEffect {
        // Wrapped effect
        base: BaseEffect

        // Duration, in number of turns
        duration: number

        // Base constructor
        constructor(base: BaseEffect, duration = 0) {
            super(base.code);

            this.base = base;
            this.duration = duration;
        }

        getOnDiffs(ship: Ship, source: Ship | Drone, success: number): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];

            let previous = ship.active_effects.get(this.id);
            if (previous) {
                result = result.concat(previous.getOffDiffs(ship));
            }

            result.push(new ShipEffectAddedDiff(ship, this));
            result = result.concat(this.base.getOnDiffs(ship, source));

            return result;
        }

        getOffDiffs(ship: Ship): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];

            if (ship.active_effects.get(this.id)) {
                result.push(new ShipEffectRemovedDiff(ship, this));
                result = result.concat(this.base.getOffDiffs(ship));
            }

            return result;
        }

        getTurnStartDiffs(ship: Ship): BaseBattleDiff[] {
            if (ship.active_effects.get(this.id)) {
                return this.base.getTurnStartDiffs(ship);
            } else {
                return [];
            }
        }

        getTurnEndDiffs(ship: Ship): BaseBattleDiff[] {
            if (ship.active_effects.get(this.id)) {
                if (this.duration > 1) {
                    let result: BaseBattleDiff[] = [new ShipEffectChangedDiff(ship, this, -1)];
                    return result.concat(this.base.getTurnEndDiffs(ship));
                } else {
                    return this.getOffDiffs(ship);
                }
            } else {
                return [];
            }
        }

        isBeneficial(): boolean {
            return this.base.isBeneficial();
        }

        getFullCode(): string {
            return this.base.getFullCode();
        }

        getDescription(): string {
            return this.base.getDescription() + ` for ${this.duration} turn${this.duration > 1 ? "s" : ""}`;
        }
    }
}

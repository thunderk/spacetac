/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Apply vigilance effects on a ship that enters a vigilance area
     */
    export class VigilanceEffect extends BaseEffect {
        constructor(private action: VigilanceAction) {
            super("vigilance");
        }

        getOnDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            if (source instanceof Ship) {
                let result = flatten(this.action.intruder_effects.map(effect => effect.getOnDiffs(ship, source)));
                if (result.length > 0) {
                    result.unshift(new VigilanceAppliedDiff(source, this.action, ship));
                }
                return result;
            } else {
                return [];
            }
        }

        isInternal(): boolean {
            return true;
        }

        isBeneficial(): boolean {
            return false;
        }

        getDescription(): string {
            return `Vigilance from ${this.action.name}`;
        }
    }
}

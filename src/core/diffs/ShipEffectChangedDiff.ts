/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * An effect attached to a ship changed
     */
    export class ShipEffectChangedDiff extends BaseBattleShipDiff {
        // Effect modified
        effect: RObjectId

        // Duration diff
        duration: number

        constructor(ship: Ship | RObjectId, effect: BaseEffect | RObjectId, duration = 0) {
            super(ship);

            this.effect = (effect instanceof BaseEffect) ? effect.id : effect;
            this.duration = duration;
        }

        protected applyOnShip(ship: Ship, battle: Battle): void {
            let effect = ship.active_effects.get(this.effect);
            if (effect) {
                if (this.duration) {
                    if (effect instanceof StickyEffect) {
                        effect.duration += this.duration;
                    } else {
                        console.error("Could not apply diff - not a sticky effect", this, ship);
                    }
                }
            } else {
                console.error("Could not apply diff - effect not found on ship", this, ship);
            }
        }

        protected getReverse(): BaseBattleDiff {
            return new ShipEffectChangedDiff(this.ship_id, this.effect, -this.duration);
        }
    }
}

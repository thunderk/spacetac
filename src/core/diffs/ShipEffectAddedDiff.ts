/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * An effect is attached to a ship
     */
    export class ShipEffectAddedDiff extends BaseBattleShipDiff {
        // Effect added
        effect: BaseEffect

        constructor(ship: Ship | RObjectId, effect: BaseEffect) {
            super(ship);

            this.effect = duplicate(effect, TK.SpaceTac);
        }

        protected applyOnShip(ship: Ship, battle: Battle): void {
            ship.active_effects.add(duplicate(this.effect, TK.SpaceTac));
        }

        protected getReverse(): BaseBattleDiff {
            return new ShipEffectRemovedDiff(this.ship_id, this.effect);
        }
    }

    /**
     * An attached effect is removed from a ship
     */
    export class ShipEffectRemovedDiff extends BaseBattleShipDiff {
        // Effect removed
        effect: BaseEffect

        constructor(ship: Ship | RObjectId, effect: BaseEffect) {
            super(ship);

            this.effect = duplicate(effect, TK.SpaceTac);
        }

        protected applyOnShip(ship: Ship, battle: Battle): void {
            ship.active_effects.remove(this.effect);
        }

        protected getReverse(): BaseBattleDiff {
            return new ShipEffectAddedDiff(this.ship_id, this.effect);
        }
    }
}

/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    type ShipAttributeModifier = {
        cumulative?: number,
        multiplier?: number,
        limit?: number
    }

    /**
     * A ship attribute modifier changed
     */
    export class ShipAttributeDiff extends BaseBattleShipDiff {
        // Attribute that changes
        code: keyof ShipAttributes

        // Modifiers added
        added: ShipAttributeModifier

        // Modifiers removed
        removed: ShipAttributeModifier

        constructor(ship: Ship | RObjectId, code: keyof ShipAttributes, added: ShipAttributeModifier, removed: ShipAttributeModifier) {
            super(ship);

            this.code = code;
            this.added = added;
            this.removed = removed;
        }

        getReverse(): BaseBattleDiff {
            return new ShipAttributeDiff(this.ship_id, this.code, this.removed, this.added);
        }

        applyOnShip(ship: Ship, battle: Battle): void {
            let attribute = ship.attributes[this.code];
            attribute.addModifier(this.added.cumulative, this.added.multiplier, this.added.limit);
            attribute.removeModifier(this.removed.cumulative, this.removed.multiplier, this.removed.limit);
        }
    }
}
/// <reference path="BaseBattleEvent.ts"/>

module TK.SpaceTac {
    /**
     * Event logged when a ship value or attribute changed
     */
    export class ValueChangeEvent extends BaseLogShipEvent {
        // Ship ID
        ship_id: RObjectId

        // Saved version of the current value
        value: ShipValue

        // Value variation
        diff: number

        constructor(ship: Ship, value: ShipValue, diff: number) {
            super("value", ship);

            this.ship_id = ship.id;
            this.value = copy(value);
            this.diff = diff;
        }

        getReverse(): BaseBattleEvent {
            let value = copy(this.value);
            value.set(value.get() - this.diff);
            return new ValueChangeEvent(this.ship, value, -this.diff);
        }

        apply(battle: Battle): void {
            let ship = battle.getShip(this.ship_id);
            if (ship) {
                ship.setValue(<any>this.value.name, this.value.get(), false, false);
            } else {
                console.warn("Ship not found", this);
            }
        }
    }
}

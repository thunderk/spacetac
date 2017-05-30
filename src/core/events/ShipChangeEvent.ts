/// <reference path="BaseBattleEvent.ts"/>

module TS.SpaceTac {
    /**
     * Event that changes the current playing ship
     */
    export class ShipChangeEvent extends BaseLogShipEvent {
        // Ship that starts playing
        new_ship: Ship;

        constructor(ship: Ship, new_ship: Ship) {
            super("ship_change", ship, new_ship ? Target.newFromShip(new_ship) : null);

            this.new_ship = new_ship;
        }

        getReverse(): BaseBattleEvent {
            return new ShipChangeEvent(this.new_ship, this.ship);
        }
    }
}

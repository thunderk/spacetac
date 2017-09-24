/// <reference path="BaseBattleEvent.ts"/>

module TK.SpaceTac {
    // Event logged when a ship is dead
    export class DeathEvent extends BaseLogShipEvent {
        constructor(ship: Ship) {
            super("death", ship);
        }
    }
}

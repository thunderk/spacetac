module SpaceTac.Game {
    "use strict";

    // A fleet of ships
    export class Fleet {
        // Fleet owner
        player: Player;

        // List of ships
        ships: Ship[];

        // Create a fleet, bound to a player
        constructor(player: Player) {
            this.player = player;
            this.ships = [];
        }

        // Add a ship in this fleet
        addShip(ship: Ship): void {
            ship.fleet = this;
            this.ships.push(ship);
        }
    }
}

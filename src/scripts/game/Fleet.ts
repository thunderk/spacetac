module SpaceTac.Game {
    "use strict";

    // A fleet of ships
    export class Fleet {
        // Fleet owner
        player: Player;

        // List of ships
        ships: Ship[];

        // Current battle in which the fleet is engaged (null if not fighting)
        battle: Battle;

        // Create a fleet, bound to a player
        constructor(player: Player) {
            this.player = player;
            this.ships = [];
            this.battle = null;
        }

        // Add a ship in this fleet
        addShip(ship: Ship): void {
            ship.fleet = this;
            this.ships.push(ship);
        }

        // Set the current battle
        setBattle(battle: Battle): void {
            this.battle = battle;
        }
    }
}

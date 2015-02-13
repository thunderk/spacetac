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
        constructor(player: Player = null) {
            this.player = player || new Player();
            this.ships = [];
            this.battle = null;
        }

        // Add a ship in this fleet
        addShip(ship: Ship): void {
            if (this.ships.indexOf(ship) < 0) {
                this.ships.push(ship);
            }
            ship.fleet = this;
        }

        // Set the current battle
        setBattle(battle: Battle): void {
            this.battle = battle;
        }

        // Check if the fleet still has living ships
        isAlive(): boolean {
            var count = 0;
            this.ships.forEach((ship: Ship) => {
                if (ship.alive) {
                    count += 1;
                }
            });
            return (count > 0);
        }
    }
}

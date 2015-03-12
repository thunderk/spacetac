/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    // A fleet of ships
    export class Fleet extends Serializable {
        // Fleet owner
        player: Player;

        // List of ships
        ships: Ship[];

        // Current battle in which the fleet is engaged (null if not fighting)
        battle: Battle;

        // Create a fleet, bound to a player
        constructor(player: Player = null) {
            super();

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

        // Get the average level of this fleet
        getLevel(): number {
            if (this.ships.length === 0) {
                return 0;
            }

            var sum = 0;
            this.ships.forEach((ship: Ship) => {
                sum += ship.level;
            });
            var avg = sum / this.ships.length;
            return Math.round(avg);
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

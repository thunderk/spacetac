module TS.SpaceTac {
    /**
     * A fleet of ships, all belonging to the same player
     */
    export class Fleet {
        // Fleet owner
        player: Player;

        // List of ships
        ships: Ship[];

        // Current fleet location
        location: StarLocation;

        // Current battle in which the fleet is engaged (null if not fighting)
        battle: Battle;

        // Create a fleet, bound to a player
        constructor(player: Player = null) {
            this.player = player || new Player();
            this.ships = [];
            this.location = null;
            this.battle = null;
        }

        /**
         * Set the current location of the fleet
         * 
         * Returns true on success
         */
        setLocation(location: StarLocation, force = false): boolean {
            if (!force && this.location && location.star != this.location.star && (this.location.type != StarLocationType.WARP || this.location.jump_dest != location)) {
                return false;
            }

            this.location = location;
            this.player.setVisited(this.location);

            // Check encounter
            var battle = this.location.enterLocation(this.player.fleet);
            if (battle) {
                this.player.setBattle(battle);
            }

            return true;
        }

        // Add a ship in this fleet
        addShip(ship: Ship): Ship {
            if (ship.fleet && ship.fleet != this) {
                remove(ship.fleet.ships, ship);
            }
            add(this.ships, ship);
            ship.fleet = this;
            return ship;
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

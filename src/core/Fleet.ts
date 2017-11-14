module TK.SpaceTac {
    /**
     * A fleet of ships, all belonging to the same player
     */
    export class Fleet {
        // Fleet owner
        player: Player;

        // List of ships
        ships: Ship[];

        // Current fleet location
        location: StarLocation | null = null;
        previous_location: StarLocation | null = null;

        // Current battle in which the fleet is engaged (null if not fighting)
        battle: Battle | null = null;

        // Amount of credits available
        credits = 0;

        // Create a fleet, bound to a player
        constructor(player = new Player()) {
            this.player = player;
            this.ships = [];
        }

        jasmineToString(): string {
            return `${this.player.name}'s fleet [${this.ships.map(ship => ship.getFullName()).join(",")}]`;
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

            this.previous_location = this.location;
            this.location = location;
            this.player.setVisited(this.location);

            // Check encounter
            var battle = this.location.enterLocation(this.player.fleet);
            if (battle) {
                this.player.setBattle(battle);
            }

            return true;
        }

        /**
         * Add a ship this fleet
         */
        addShip(ship = new Ship(null, `${this.player.name} ${this.ships.length + 1}`)): Ship {
            if (ship.fleet && ship.fleet != this) {
                remove(ship.fleet.ships, ship);
            }
            add(this.ships, ship);
            ship.fleet = this;
            if (this.battle) {
                this.battle.ships.add(ship);
            }
            return ship;
        }

        /**
         * Remove the ship from this fleet, transferring it to another fleet
         */
        removeShip(ship: Ship, fleet = new Fleet()): void {
            if (ship.fleet === this) {
                fleet.addShip(ship);
            }
        }

        // Set the current battle
        setBattle(battle: Battle | null): void {
            this.battle = battle;
        }

        // Get the average level of this fleet
        getLevel(): number {
            if (this.ships.length === 0) {
                return 0;
            }

            var sum = 0;
            this.ships.forEach((ship: Ship) => {
                sum += ship.level.get();
            });
            var avg = sum / this.ships.length;
            return Math.floor(avg);
        }

        /**
         * Check if the fleet is considered alive (at least one ship alive, and no critical ship dead)
         */
        isAlive(): boolean {
            if (any(this.ships, ship => ship.critical && !ship.alive)) {
                return false;
            } else {
                return any(this.ships, ship => ship.alive);
            }
        }

        /**
         * Add an equipment to the first available cargo slot
         * 
         * Returns true on success, false if no empty cargo slot was available.
         */
        addCargo(equipment: Equipment): boolean {
            let ship = first(this.ships, ship => ship.getFreeCargoSpace() > 0);
            if (ship) {
                return ship.addCargo(equipment);
            } else {
                return false;
            }
        }
    }
}

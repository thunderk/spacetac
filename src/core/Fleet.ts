module TK.SpaceTac {
    /**
     * A fleet of ships, all belonging to the same player
     */
    export class Fleet {
        // Fleet owner
        player: Player

        // Fleet name
        name: string

        // List of ships
        ships: Ship[]

        // Current fleet location
        location: RObjectId | null = null

        // Visited locations (ordered by last visited)
        visited: RObjectId[] = []

        // Current battle in which the fleet is engaged (null if not fighting)
        battle: Battle | null = null

        // Amount of credits available
        credits = 0

        // Create a fleet, bound to a player
        constructor(player = new Player()) {
            this.player = player;
            this.name = player ? player.name : "Fleet";
            this.ships = [];
        }

        jasmineToString(): string {
            return `${this.name} [${this.ships.map(ship => ship.getName()).join(",")}]`;
        }

        /**
         * Set the owner player
         */
        setPlayer(player: Player): void {
            this.player = player;
        }

        /**
         * Set a location as visited
         */
        setVisited(location: StarLocation): void {
            remove(this.visited, location.id);
            this.visited.unshift(location.id);
        }

        /**
         * Move the fleet to another location, checking that the move is physically possible
         * 
         * Returns true on success
         */
        move(to: StarLocation): boolean {
            if (!this.location) {
                return false;
            }

            let source = to.universe.locations.get(this.location);
            if (!source) {
                return false;
            }

            if (source.star != to.star) {
                // Need to jump, check conditions
                if (source.type != StarLocationType.WARP || source.jump_dest != to) {
                    return false;
                }
            }

            this.setLocation(to);
            return true;
        }

        /**
         * Set the current location of the fleet, without condition
         */
        setLocation(location: StarLocation): void {
            if (this.location) {
                let previous = location.universe.locations.get(this.location);
                if (previous) {
                    previous.removeFleet(this);
                }
            }

            this.location = location.id;
            this.setVisited(location);
            location.addFleet(this);
        }

        /**
         * Add a ship this fleet
         */
        addShip(ship = new Ship(null, `${this.name} ${this.ships.length + 1}`)): Ship {
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
    }
}

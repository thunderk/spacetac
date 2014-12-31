module SpaceTac.Game {
    // A single ship in a Fleet
    export class Ship {
        // Fleet this ship is a member of
        fleet: Fleet;

        // Name of the ship
        name: string;

        // Current level
        level: number;

        // Number of shield points
        shield: number;

        // Number of hull points
        hull: number;

        // Position in the arena
        arena_x: number;
        arena_y: number;

        // Facing direction in the arena
        arena_angle: number;

        // Current initiative level (high numbers will allow this ship to play sooner)
        initiative_level: number;

        // Last initiative throw
        initative_throw: number;

        // Current number of action points
        ap_current: number;

        // Maximal number of action points
        ap_maximal: number;

        // Number of action points recovered by turn
        ap_recover: number;

        // Number of action points used to make a 1.0 move
        movement_cost: number;

        // Create a new ship inside a fleet
        constructor(fleet: Fleet, name: string) {
            this.fleet = fleet;
            this.name = name;
            this.initiative_level = 1;

            if (fleet) {
                fleet.addShip(this);
            }
        }

        // Set position in the arena
        //  This does not consumes action points
        setArenaPosition(x: number, y: number) {
            this.arena_x = x;
            this.arena_y = y;
        }

        // Set facing angle in the arena
        setArenaFacingAngle(angle: number) {
            this.arena_angle = angle;
        }

        // String repr
        jasmineToString(): string {
            return "Ship " + this.name;
        }

        // Make an initiative throw, to resolve play order in a battle
        throwInitiative(gen: RandomGenerator): void {
            this.initative_throw = gen.throw(this.initiative_level);
        }

        // Return the player owning this ship
        getPlayer(): Player {
            return this.fleet.player;
        }

        // Consumes action points
        useActionPoints(ap: number): void {
            this.ap_current -= ap;

            if (this.ap_current <= 0.001) {
                this.ap_current = 0;
            }
        }

        // Get the maximal position reachable in the arena with current action points
        getLongestMove(x: number, y: number): number[] {
            var dx = x - this.arena_x;
            var dy = y - this.arena_y;
            var length = Math.sqrt(dx * dx + dy * dy);
            var max_length = this.ap_current / this.movement_cost;
            if (max_length >= length) {
                return [x, y];
            } else {
                var factor = max_length / length;
                return [this.arena_x + dx * factor, this.arena_y + dy * factor];
            }
        }

        // Move toward a location, consuming action points
        moveTo(x: number, y: number): void {
            var dest = this.getLongestMove(x, y);
            var dx = dest[0] - this.arena_x;
            var dy = dest[1] - this.arena_y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var cost = distance * this.movement_cost;

            this.setArenaPosition(this.arena_x + dx, this.arena_y + dy);
            this.useActionPoints(cost);
        }
    }
}
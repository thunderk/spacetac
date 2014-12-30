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

        // Create a new ship inside a fleet
        constructor(fleet: Fleet, name: string) {
            this.fleet = fleet;
            this.name = name;
            this.initiative_level = 1;

            fleet.addShip(this);
        }

        // Set position in the arena
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
    }
}
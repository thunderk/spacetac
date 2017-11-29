module TK.SpaceTac {
    /**
     * Drones are static objects that apply effects in a circular zone around themselves.
     */
    export class Drone extends RObject {
        // ID of the owning ship
        owner: RObjectId

        // Code of the drone
        code: string

        // Location in arena
        x: number
        y: number
        radius: number

        // Effects to apply
        effects: BaseEffect[] = []

        // Action that triggered that drone
        parent: DeployDroneAction | null = null;

        constructor(owner: Ship, code = "drone") {
            super();

            this.owner = owner.id;
            this.code = code;
        }

        /**
         * Return the current location of the drone
         */
        get location(): ArenaLocation {
            return new ArenaLocation(this.x, this.y);
        }

        /**
         * Get a textual description of this drone
         */
        getDescription(): string {
            let effects = this.effects.map(effect => "• " + effect.getDescription()).join("\n");
            if (effects.length == 0) {
                effects = "• do nothing";
            }
            return `While deployed:\n${effects}`;
        }

        /**
         * Check if a location is in range
         */
        isInRange(x: number, y: number): boolean {
            return Target.newFromLocation(x, y).getDistanceTo(this) <= this.radius;
        }

        /**
         * Get the list of affected ships.
         */
        getAffectedShips(battle: Battle): Ship[] {
            let ships = ifilter(battle.iships(), ship => ship.alive && ship.isInCircle(this.x, this.y, this.radius));
            return imaterialize(ships);
        }
    }
}
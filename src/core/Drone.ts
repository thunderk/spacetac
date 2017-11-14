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

        // Remaining lifetime in number of turns
        duration: number

        // Effects to apply
        effects: BaseEffect[] = []

        constructor(owner: Ship, code = "drone", base_duration = 1) {
            super();

            this.owner = owner.id;
            this.code = code;
            this.duration = base_duration;
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
            return `For ${this.duration} activation${this.duration > 1 ? "s" : ""}:\n${effects}`;
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

        /**
         * Get the list of diffs needed to apply the drone effects on a list of ships.
         * 
         * This does not check if the ships are in range.
         */
        getDiffs(battle: Battle, ships: Ship[]): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];

            if (this.duration >= 1 && ships.length > 0) {
                result.push(new DroneAppliedDiff(this, ships));

                ships.forEach(ship => {
                    result = result.concat(flatten(this.effects.map(effect => effect.getOnDiffs(ship, this))));
                });
            }

            if (this.duration <= 1) {
                result.push(new DroneDestroyedDiff(this));
            }

            return result;
        }

        /**
         * Apply one drone "activation"
         */
        activate(battle: Battle) {
            let diffs = this.getDiffs(battle, this.getAffectedShips(battle));
            battle.applyDiffs(diffs);
        }
    }
}
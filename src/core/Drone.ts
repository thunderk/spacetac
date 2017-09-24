module TK.SpaceTac {
    /**
     * Drones are static objects that apply effects in a circular zone around themselves.
     */
    export class Drone {
        // Battle in which the drone is deployed
        battle: Battle;

        // Ship that launched the drone (informative, a drone is autonomous)
        owner: Ship;

        // Code of the drone
        code: string;

        // Location in arena
        x: number;
        y: number;
        radius: number;

        // Remaining lifetime in number of turns
        duration: number;

        // Effects to apply
        effects: BaseEffect[] = [];

        constructor(owner: Ship, code = "drone", base_duration = 1) {
            this.battle = owner.getBattle() || new Battle();
            this.owner = owner;
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
        getAffectedShips(): Ship[] {
            let ships = ifilter(this.battle.iships(), ship => ship.alive && ship.isInCircle(this.x, this.y, this.radius));
            return imaterialize(ships);
        }

        /**
         * Apply the effects on a list of ships
         * 
         * This does not check if the ships are in range.
         */
        apply(ships: Ship[], log = true) {
            if (ships.length > 0) {
                if (log) {
                    this.battle.log.add(new DroneAppliedEvent(this, ships));
                }

                ships.forEach(ship => {
                    this.effects.forEach(effect => effect.applyOnShip(ship, this));
                });
            }
        }

        /**
         * Activate the drone
         */
        activate(log = true) {
            this.apply(this.getAffectedShips(), log);

            this.duration--;
            if (this.duration == 0) {
                this.battle.removeDrone(this, log);
            }
        }
    }
}
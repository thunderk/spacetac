module TS.SpaceTac {
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

        // Cycle countdown for ships
        countdown: [Ship, number][] = [];

        constructor(owner: Ship, code = "drone", base_duration = 1) {
            this.battle = owner.getBattle() || new Battle();
            this.owner = owner;
            this.code = code;
            this.duration = base_duration * this.battle.getCycleLength();
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
         * Get countdown until next activation for a given ship
         */
        getShipCountdown(ship: Ship): number {
            let countdown = 0;
            this.countdown.forEach(([iship, icountdown]) => {
                if (iship === ship) {
                    countdown = icountdown;
                }
            });
            return countdown;
        }

        /**
         * Start the countdown for a given ship
         */
        startShipCountdown(ship: Ship): void {
            let found = false;
            this.countdown = this.countdown.map(([iship, countdown]): [Ship, number] => {
                if (iship === ship) {
                    found = true;
                    return [iship, this.battle.getCycleLength()];
                } else {
                    return [iship, countdown];
                }
            });
            if (!found) {
                this.countdown.push([ship, this.battle.getCycleLength()]);
            }
        }

        /**
         * Get the list of affected ships.
         */
        getAffectedShips(): Ship[] {
            let ships = ifilter(this.battle.iships(), ship => ship.alive && ship.isInCircle(this.x, this.y, this.radius) && this.getShipCountdown(ship) == 0);
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
                    this.startShipCountdown(ship);
                    this.effects.forEach(effect => effect.applyOnShip(ship));
                });
            }
        }

        /**
         * Activate the drone
         */
        activate(log = true) {
            this.apply(this.getAffectedShips(), log);

            this.countdown = this.countdown.map(([ship, countdown]): [Ship, number] => [ship, countdown - 1]).filter(([ship, countdown]) => countdown > 0);

            this.duration--;
            if (this.duration == 0) {
                this.battle.removeDrone(this, log);
            }
        }
    }
}
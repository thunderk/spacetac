module TK.SpaceTac {
    /**
     * Base class for all Artificial Intelligence interaction
     */
    export class AbstractAI {
        // Name of the AI
        name: string

        // Current ship being played
        ship: Ship

        // Random generator, if needed
        random = RandomGenerator.global

        // Timer for scheduled calls
        timer: Timer

        // Debug mode
        debug = false

        // Time at which work as started
        private started: number

        constructor(ship: Ship, timer = Timer.global, name?: string) {
            this.ship = ship;
            this.timer = timer;
            this.name = name || classname(this);
        }

        toString = () => this.name;

        /**
         * Start playing current ship's turn.
         */
        async play(debug = false): Promise<void> {
            this.started = (new Date()).getTime();
            this.debug = debug;

            if (!this.ship.playing) {
                console.error(`${this.name} tries to play a ship out of turn`);
                return;
            }

            // Work loop
            this.initWork();
            let last = new Date().getTime();
            let ship = this.ship;
            while (this.doWorkUnit()) {
                if (!this.ship.playing || this.ship != ship) {
                    console.error(`${this.name} switched to another ship in unit work`);
                    break;
                }
                if (this.getDuration() >= 10000) {
                    console.warn(`${this.name} takes too long to play, forcing turn end`);
                    break;
                }

                let t = new Date().getTime();
                if (t - last > 50) {
                    await this.timer.sleep(10);
                    last = t + 10;
                }
            }

            // End the ship turn
            this.applyAction(EndTurnAction.SINGLETON, Target.newFromShip(ship));
        }

        /**
         * Make the AI play an action
         * 
         * This should be the only real interaction point with battle state
         */
        private applyAction(action: BaseAction, target: Target): boolean {
            let battle = this.ship.getBattle();
            if (battle) {
                return battle.applyOneAction(action, target);
            } else {
                return false;
            }
        }

        /**
         * Make the AI play a full maneuver (sequence of actions)
         */
        applyManeuver(maneuver: Maneuver): boolean {
            if (maneuver.simulation.success) {
                let parts = maneuver.simulation.parts;
                for (let i = 0; i < parts.length; i++) {
                    let part = parts[i];
                    if (part.action instanceof EndTurnAction || !part.possible || !this.applyAction(part.action, part.target)) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        }

        /**
         * Prepare the groundwork for future doWorkUnit calls
         */
        protected initWork(): void {
        }

        /**
         * Do a single unit of synchronous work
         * 
         * Returns true if something was done, false if the AI should end the ship turn and stop.
         */
        protected doWorkUnit(): boolean {
            return false;
        }

        /**
         * Get the time spent thinking on this turn
         */
        protected getDuration() {
            return (new Date()).getTime() - this.started;
        }
    }
}

module TK.SpaceTac {
    /**
     * Feeback that will be called with each proposed maneuver, and should return true if the AI is to continue playing
     */
    export type AIFeedback = (maneuver: Maneuver) => boolean;

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

        // Feedback to send maneuvers to
        feedback: AIFeedback

        // Time at which work as started
        private started: number

        constructor(ship: Ship, feedback?: AIFeedback, debug = false, timer = Timer.global, name?: string) {
            this.ship = ship;
            this.feedback = feedback ? feedback : ((maneuver: Maneuver) => maneuver.apply(nn(this.ship.getBattle())));
            this.debug = debug;
            this.timer = timer;
            this.name = name || classname(this);
        }

        toString = () => this.name;

        /**
         * Start playing current ship's turn.
         */
        async play(): Promise<void> {
            this.started = (new Date()).getTime();

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
            if (this.ship.playing) {
                this.feedback(new Maneuver(this.ship, EndTurnAction.SINGLETON, Target.newFromShip(ship)));
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

module TK.SpaceTac {
    /**
     * A list of active missions
     */
    export class ActiveMissions {
        main: Mission | null = null
        secondary: Mission[] = []
        nextid = 2

        /**
         * Start the main story arc
         */
        startMainStory(universe: Universe, fleet: Fleet) {
            this.main = new MainStory(universe, fleet);
            this.main.setStarted(1);
        }

        /**
         * Add a secondary mission to the pool
         * 
         * Returns true on success
         */
        addSecondary(mission: Mission, fleet: Fleet): boolean {
            if (!mission.main && this.secondary.length < 2) {
                mission.fleet = fleet;
                this.secondary.push(mission);
                mission.setStarted(this.nextid++);
                return true;
            } else {
                return false;
            }
        }

        /**
         * Get the current list of active missions
         */
        getCurrent(): Mission[] {
            let result: Mission[] = [];
            if (this.main) {
                result.push(this.main);
            }
            return result.concat(this.secondary);
        }

        /**
         * Check status for all active missions
         * 
         * This will remove ended missions
         */
        checkStatus(): void {
            if (this.main) {
                if (!this.main.checkStatus()) {
                    this.main = null;
                }
            }
            this.secondary = this.secondary.filter(mission => mission.checkStatus());
        }

        /**
         * Get a hash that will change when any active mission changes status
         */
        getHash(): number {
            return sum(this.getCurrent().map(mission => mission.id * 10000 + mission.getIndex()));
        }
    }
}

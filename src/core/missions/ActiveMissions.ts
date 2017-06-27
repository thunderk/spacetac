module TS.SpaceTac {
    /**
     * A list of active missions
     */
    export class ActiveMissions {
        main: Mission | null = null
        secondary: Mission[] = []

        constructor() {
        }

        /**
         * Start the main story arc
         */
        startMainStory(universe: Universe, fleet: Fleet) {
            this.main = new MainStory(universe, fleet);
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
        checkStatus(fleet: Fleet, universe: Universe): void {
            if (this.main) {
                if (!this.main.checkStatus(fleet, universe)) {
                    this.main = null;
                }
            }
            this.secondary = this.secondary.filter(mission => mission.checkStatus(fleet, universe));
        }
    }
}

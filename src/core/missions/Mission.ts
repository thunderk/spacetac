module TS.SpaceTac {
    /**
     * A mission (or quest) assigned to the player
     */
    export class Mission {
        // Link to the fleet this mission has been assigned to
        fleet: Fleet

        // Link to the universe in which the mission plays
        universe: Universe

        // Indicator that the quest is part of the main story arc
        main: boolean

        // Parts of the mission
        parts: MissionPart[]

        // Current part
        current_part: MissionPart

        // Indicator that the mission is completed
        completed: boolean

        constructor(universe: Universe, fleet: Fleet, main = false) {
            this.universe = universe;
            this.fleet = fleet;
            this.main = main;
            this.parts = [];
            this.completed = false;
            this.current_part = new MissionPart(this, "Empty mission");
        }

        /**
         * Add a part to the mission.
         */
        addPart<T extends MissionPart>(part: T): T {
            if (part.mission === this) {
                this.parts.push(part);
                if (this.parts.length == 1) {
                    this.current_part = this.parts[0];
                }
                this.completed = false;
            }
            return part;
        }

        /**
         * Check the status for current part, and move on to next part if necessary.
         * 
         * Returns true if the mission is still active.
         */
        checkStatus(): boolean {
            if (this.completed) {
                return false;
            } else if (this.current_part.checkCompleted()) {
                this.current_part.onEnded();

                let current_index = this.parts.indexOf(this.current_part);
                if (current_index < 0 || current_index >= this.parts.length - 1) {
                    this.completed = true;
                    return false;
                } else {
                    this.current_part = this.parts[current_index + 1];
                    this.current_part.onStarted();
                    return true;
                }
            } else {
                return true;
            }
        }
    }
}

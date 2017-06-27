module TS.SpaceTac {
    /**
     * A mission (or quest) assigned to the player
     */
    export class Mission {
        // Indicator that the quest is part of the main story arc
        main: boolean

        // Parts of the mission
        parts: MissionPart[]

        // Current part
        current_part: MissionPart

        // Indicator that the mission is completed
        completed: boolean

        constructor(parts: MissionPart[], main = false) {
            this.main = main;
            this.parts = parts;
            this.current_part = parts[0];
            this.completed = false;
        }

        /**
         * Check the status for current part, and move on to next part if necessary.
         * 
         * Returns true if the mission is still active.
         */
        checkStatus(fleet: Fleet, universe: Universe): boolean {
            if (this.completed) {
                return false;
            } else if (this.current_part.checkCompleted(fleet, universe)) {
                let current_index = this.parts.indexOf(this.current_part);
                if (current_index < 0 || current_index >= this.parts.length - 1) {
                    this.completed = true;
                    return false;
                } else {
                    this.current_part = this.parts[current_index + 1];
                    return true;
                }
            } else {
                return true;
            }
        }
    }
}

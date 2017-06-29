module TS.SpaceTac {
    /**
     * An abstract part of a mission, describing the goal
     */
    export class MissionPart {
        // Link to mission
        mission: Mission

        // Very short description
        title: string

        constructor(mission: Mission, title: string) {
            this.mission = mission;
            this.title = title;
        }

        get universe(): Universe {
            return this.mission.universe;
        }
        get fleet(): Fleet {
            return this.mission.fleet;
        }

        /**
         * Abstract checking if the part is completed
         */
        checkCompleted(): boolean {
            return false;
        }

        /**
         * Force the part as completed
         * 
         * This is a cheat, and should enforce the part conditions
         */
        forceComplete(): void {
        }
    }
}

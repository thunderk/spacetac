module TS.SpaceTac {
    /**
     * An abstract part of a mission, describing the goal
     */
    export class MissionPart {
        // Very short description
        title: string

        constructor(title: string) {
            this.title = title;
        }

        /**
         * Abstract checking if the part is completed
         */
        checkCompleted(fleet: Fleet, universe: Universe): boolean {
            return false;
        }
    }
}

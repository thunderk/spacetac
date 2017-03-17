module TS.SpaceTac {
    /**
     * Level and experience system for a ship.
     */
    export class ShipLevel {
        private level = 1;
        private experience = 0;

        /**
         * Get current level
         */
        get(): number {
            return this.level;
        }

        /**
         * Get the next experience goal to reach, to gain one level
         */
        getNextGoal(): number {
            return isum(imap(irange(this.level), i => (i + 1) * 100));
        }

        /**
         * Force experience gain, to reach a given level
         */
        forceLevel(level: number) {
            while (this.level < level) {
                this.addExperience(this.getNextGoal());
                this.checkLevelUp();
            }
        }

        /**
         * Check for level-up
         * 
         * Returns true if level changed
         */
        checkLevelUp(): boolean {
            let changed = false;
            while (this.experience > this.getNextGoal()) {
                this.level++;
                changed = true;
            }
            return changed;
        }

        /**
         * Add experience points
         */
        addExperience(points: number) {
            this.experience += points;
        }

        /**
         * Get skill points given by current level
         */
        getSkillPoints(): number {
            return 5 + 5 * this.level;
        }
    }
}

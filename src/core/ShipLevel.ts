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
         * Get the current experience points
         */
        getExperience(): number {
            return this.experience;
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
        forceLevel(level: number): void {
            while (this.level < level) {
                this.forceLevelUp();
            }
        }

        /**
         * Force a level up
         */
        forceLevelUp(): void {
            let old_level = this.level;

            this.addExperience(this.getNextGoal() - this.experience);
            this.checkLevelUp();

            if (old_level >= this.level) {
                // security against infinite loops
                throw new Error("No effective level up");
            }
        }

        /**
         * Check for level-up
         * 
         * Returns true if level changed
         */
        checkLevelUp(): boolean {
            let changed = false;
            while (this.experience >= this.getNextGoal()) {
                this.level++;
                changed = true;
            }
            return changed;
        }

        /**
         * Add experience points
         */
        addExperience(points: number): void {
            this.experience += points;
        }

        /**
         * Get skill points given by current level
         */
        getSkillPoints(): number {
            return 5 + 5 * this.level;
        }

        /**
         * Get the level needed to have a given total of points
         */
        static getLevelForPoints(points: number): number {
            let lev = new ShipLevel();
            while (lev.getSkillPoints() < points) {
                lev.forceLevelUp();
            }
            return lev.level;
        }

        /**
         * Get the points available at a given level
         */
        static getPointsForLevel(level: number): number {
            let lev = new ShipLevel();
            lev.forceLevel(level);
            return lev.getSkillPoints();
        }
    }
}

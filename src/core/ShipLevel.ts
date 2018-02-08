module TK.SpaceTac {
    /**
     * Level and experience system for a ship, with enabled upgrades.
     */
    export class ShipLevel {
        private level = 1
        private experience = 0
        private upgrades: string[] = []

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
         * Get the activated upgrades
         */
        getUpgrades(): string[] {
            return acopy(this.upgrades);
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
         * Get upgrade points given by current level
         * 
         * This does not deduce activated upgrades usage
         */
        getUpgradePoints(): number {
            return this.level > 1 ? (3 * this.level) : 0;
        }

        /**
         * (De)Activate an upgrade
         * 
         * This does not check the upgrade points needed
         */
        activateUpgrade(upgrade: ModelUpgrade, active: boolean): void {
            if (active) {
                add(this.upgrades, upgrade.code);
            } else {
                remove(this.upgrades, upgrade.code);
            }
        }

        /**
         * Check if an upgrade is active
         */
        hasUpgrade(upgrade: ModelUpgrade): boolean {
            return contains(this.upgrades, upgrade.code);
        }
    }
}

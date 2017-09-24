module TK.SpaceTac {
    /**
     * Reward for a mission (either an equipment or money)
     */
    export type MissionReward = Equipment | number

    /**
     * Level of difficulty for a mission
     */
    export enum MissionDifficulty {
        easy,
        normal,
        hard
    }

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

        // Title of this mission (should be kept short)
        title: string

        // Estimated mission difficulty and value (expected reward value)
        difficulty: MissionDifficulty = MissionDifficulty.normal
        value = 0

        // Reward when this mission is completed
        reward: MissionReward | null = null

        // Numerical identifier
        id = -1

        constructor(universe: Universe, fleet = new Fleet(), main = false) {
            this.universe = universe;
            this.fleet = fleet;
            this.main = main;
            this.parts = [];
            this.completed = false;
            this.current_part = new MissionPart(this, "Empty mission");
            this.title = main ? "Main story" : "Secondary mission";
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
         * Get the index of current part
         */
        getIndex(): number {
            return this.parts.indexOf(this.current_part);
        }

        /**
         * Get a small text describing the associated reward
         */
        getRewardText(): string {
            if (this.reward) {
                if (this.reward instanceof Equipment) {
                    return this.reward.getFullName();
                } else {
                    return `${this.reward} zotys`;
                }
            } else {
                return "-";
            }
        }

        /**
         * Set the difficulty level
         */
        setDifficulty(description: MissionDifficulty, value: number) {
            this.difficulty = description;
            this.value = value;
        }

        /**
         * Set the mission as started (start the first part)
         */
        setStarted(id: number): void {
            if (this.id < 0) {
                this.id = id;
                if (this.current_part) {
                    this.current_part.onStarted();
                }
            }
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

                let current_index = this.getIndex();
                if (current_index < 0 || current_index >= this.parts.length - 1) {
                    this.setCompleted();
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

        /**
         * Set the mission as completed, and give the reward to the fleet
         */
        setCompleted(): void {
            if (!this.completed) {
                this.completed = true;
                if (this.reward) {
                    if (this.reward instanceof Equipment) {
                        this.fleet.addCargo(this.reward);
                    } else {
                        this.fleet.credits += this.reward;
                    }
                }
            }
        }
    }
}

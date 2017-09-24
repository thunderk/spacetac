module TK.SpaceTac {
    export enum StarLocationType {
        STAR,
        WARP,
        PLANET,
        ASTEROID,
        STATION
    }

    // Point of interest in a star system
    export class StarLocation {
        // Parent star system
        star: Star;

        // Type of location
        type: StarLocationType;

        // Location in the star system
        x: number;
        y: number;

        // Absolute location in the universe
        universe_x: number;
        universe_y: number;

        // Destination for jump, if its a WARP location
        jump_dest: StarLocation | null;

        // Enemy encounter
        encounter: Fleet | null = null;
        encounter_gen = false;
        encounter_random = RandomGenerator.global;

        // Shop to buy/sell equipment
        shop: Shop | null = null;

        constructor(star = new Star(), type: StarLocationType = StarLocationType.PLANET, x: number = 0, y: number = 0) {
            this.star = star;
            this.type = type;
            this.x = x;
            this.y = y;
            this.universe_x = this.star.x + this.x;
            this.universe_y = this.star.y + this.y;
            this.jump_dest = null;
        }

        /**
         * Add a shop in this location
         */
        addShop(level = this.star.level) {
            this.shop = new Shop(level);
        }

        /**
         * Check if the location is clear of encounter
         */
        isClear(): boolean {
            return this.encounter_gen && this.encounter === null;
        }

        // Set the jump destination of a WARP location
        setJumpDestination(jump_dest: StarLocation): void {
            if (this.type === StarLocationType.WARP) {
                this.jump_dest = jump_dest;
            }
        }

        // Call this when first probing a location to generate the possible encounter
        //  Returns the encountered fleet, null if no encounter happens
        tryGenerateEncounter(): Fleet | null {
            if (!this.encounter_gen) {
                this.encounter_gen = true;

                if (this.encounter_random.random() < 0.8) {
                    this.setupEncounter();
                }
            }

            return this.encounter;
        }

        // Call this when entering a location to generate the possible encounter
        //  *fleet* is the player fleet, entering the location
        //  Returns the engaged battle, null if no encounter happens
        enterLocation(fleet: Fleet): Battle | null {
            var encounter = this.tryGenerateEncounter();
            if (encounter) {
                var battle = new Battle(fleet, encounter);
                battle.log.subscribe(event => {
                    if (event instanceof EndBattleEvent) {
                        if (!event.outcome.draw && event.outcome.winner !== encounter) {
                            // The encounter fleet lost, remove it
                            this.encounter = null;
                        }
                    }
                });
                battle.start();
                return battle;
            } else {
                return null;
            }
        }

        // Get the distance to another location
        getDistanceTo(other: StarLocation): number {
            var dx = this.x - other.x;
            var dy = this.y - other.y;

            return Math.sqrt(dx * dx + dy * dy);
        }

        /**
         * Clear an encounter, when the encountered fleet has been defeated
         */
        clearEncounter() {
            this.encounter_gen = true;
            this.encounter = null;
        }

        /**
         * Forces the setup of an encounter
         */
        setupEncounter() {
            this.encounter_gen = true;

            let fleet_generator = new FleetGenerator(this.encounter_random);
            let variations: [number, number][];
            if (this.star.level == 1) {
                variations = [[this.star.level, 2]];
            } else if (this.star.level <= 3) {
                variations = [[this.star.level, 2], [this.star.level - 1, 3]];
            } else if (this.star.level <= 6) {
                variations = [[this.star.level, 3], [this.star.level - 1, 4], [this.star.level + 1, 2]];
            } else {
                variations = [[this.star.level, 4], [this.star.level - 1, 5], [this.star.level + 1, 3], [this.star.level + 3, 2]];
            }
            let [level, enemies] = this.encounter_random.choice(variations);
            this.encounter = fleet_generator.generate(level, new Player(this.star.universe, "Enemy"), enemies, true);
        }
    }
}

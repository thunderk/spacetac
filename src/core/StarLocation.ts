module TS.SpaceTac {
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
        jump_dest: StarLocation;

        // Enemy encounter
        encounter: Fleet;
        encounter_gen: boolean;

        constructor(star: Star, type: StarLocationType = StarLocationType.PLANET, x: number = 0, y: number = 0) {
            this.star = star || new Star();
            this.type = type;
            this.x = x;
            this.y = y;
            this.universe_x = this.star.x + this.x;
            this.universe_y = this.star.y + this.y;
            this.jump_dest = null;

            this.encounter = null;
            this.encounter_gen = false;
        }

        // Set the jump destination of a WARP location
        setJumpDestination(jump_dest: StarLocation): void {
            if (this.type === StarLocationType.WARP) {
                this.jump_dest = jump_dest;
            }
        }

        // Call this when first probing a location to generate the possible encounter
        //  Returns the encountered fleet, null if no encounter happens
        tryGenerateEncounter(random: RandomGenerator = new RandomGenerator()): Fleet {
            if (!this.encounter_gen) {
                this.encounter_gen = true;

                if (random.throw() < 0.8) {
                    var fleet_generator = new FleetGenerator(random);
                    var ship_count = random.throwInt(1, 5);
                    this.encounter = fleet_generator.generate(this.star.level, null, ship_count);
                }
            }

            return this.encounter;
        }

        // Call this when entering a location to generate the possible encounter
        //  *fleet* is the player fleet, entering the location
        //  Returns the engaged battle, null if no encounter happens
        enterLocation(fleet: Fleet, random: RandomGenerator = new RandomGenerator()): Battle {
            var encounter = this.tryGenerateEncounter(random);
            if (encounter) {
                var battle = new Battle(fleet, encounter);
                battle.log.subscribe((event: BaseLogEvent) => {
                    if (event.code === "endbattle") {
                        var endbattle = <EndBattleEvent>event;
                        if (!endbattle.outcome.draw && endbattle.outcome.winner !== encounter) {
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
    }
}

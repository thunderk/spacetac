/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    export enum StarLocationType {
        STAR,
        WARP,
        PLANET,
        ASTEROID,
        STATION
    }

    // Point of interest in a star system
    export class StarLocation extends Serializable {
        // Parent star system
        star: Star;

        // Type of location
        type: StarLocationType;

        // Location in the star system
        x: number;
        y: number;

        // Destination for jump, if its a WARP location
        jump_dest: StarLocation;

        // Enemy encounter
        encounter: Fleet;
        encounter_gen: boolean;

        constructor(star: Star, type: StarLocationType, x: number, y: number) {
            super();

            this.star = star;
            this.type = type;
            this.x = x;
            this.y = y;
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
                    this.encounter.player.ai = new AI.BullyAI(this.encounter);
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
                battle.start();
                return battle;
            } else {
                return null;
            }
        }
    }
}

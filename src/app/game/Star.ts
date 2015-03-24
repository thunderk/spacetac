/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    // A star system
    export class Star extends Serializable {
        // Parent universe
        universe: Universe;

        // Location in the universe
        x: number;
        y: number;

        // Radius of the star system
        radius: number;

        // List of points of interest
        locations: StarLocation[];

        constructor(universe: Universe, x: number, y: number) {
            super();

            this.universe = universe;
            this.x = x;
            this.y = y;
            this.radius = 0.1;
            this.locations = [];
        }

        // Get the distance to another star
        getDistanceTo(star: Star): number {
            var dx = this.x - star.x;
            var dy = this.y - star.y;

            return Math.sqrt(dx * dx + dy * dy);
        }

        // Generate the contents of this star system
        generate(random: RandomGenerator = new RandomGenerator()): void {
            var location_count = random.throwInt(2, 10);
            this.locations = this.generateLocations(location_count, random);
        }

        // Generate points of interest (*count* doesn't include the star and warp locations)
        generateLocations(count: number, random: RandomGenerator = new RandomGenerator()): StarLocation[] {
            var result: StarLocation[] = [];

            // Add the star
            result.push(new StarLocation(this, StarLocationType.STAR, 0, 0));

            // Add warp locations around the star
            var warps = 3;
            while (warps--) {
                result.push(this.generateOneLocation(StarLocationType.WARP, result, this.radius * 0.3, random));
            }

            // Add random locations
            while (count--) {
                result.push(this.generateOneLocation(StarLocationType.PLANET, result, this.radius, random));
            }

            return result;
        }

        private generateOneLocation(type: StarLocationType, others: StarLocation[], radius: number, random: RandomGenerator): StarLocation {
            var x = (random.throw(2) - 1) * radius;
            var y = (random.throw(2) - 1) * radius;
            return new StarLocation(this, type, x, y);
        }
    }
}

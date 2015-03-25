/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    // A star system
    export class Star extends Serializable {

        // Available names for star systems
        static NAMES_POOL = [
            "Alpha Prime",
            "Bright Skies",
            "Costan Sector",
            "Duncan's Legacy",
            "Ethiopea",
            "Fringe Space",
            "Gesurd Deep",
            "Helios",
            "Justice Enclave",
            "Kovak Second",
            "Lumen Circle",
            "Manoa Society",
            "Neptune's Record",
            "Ominous Murmur",
            "Pirate's Landing",
            "Quasuc Effect",
            "Roaring Thunder",
            "Safe Passage",
            "Time Holes",
            "Unknown Territory",
            "Vulcan Terror",
            "Wings Aurora",
            "Xenos Trading",
            "Yu's Pride",
            "Zoki's Hammer",
            "Astral Tempest",
            "Burned Star",
            "Crystal Bride",
            "Death Star",
            "Ether Bending",
            "Forgotten Realm",
            "Galactic Ring",
            "Hegemonia",
            "Jorgon Trails",
            "Kemini System",
            "Light Rain",
            "Moons Astride",
            "Nubia's Sisters",
            "Opium Hide",
            "Paradise Quest",
            "Quarter Horizon",
            "Rising Dust",
            "Silence of Forge",
            "Titan Feet",
            "Unicorn Fly",
            "Violated Sanctuary",
            "World's Repose",
            "Xanthia's Travel",
            "Yggdrasil",
            "Zone of Ending",
        ];

        // Parent universe
        universe: Universe;

        // Name of the system (unique in the universe)
        name: string;

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
            var links = this.getLinks();
            links.forEach((link: StarLink) => {
                result.push(this.generateOneLocation(StarLocationType.WARP, result, this.radius * 0.3, random));
            });

            // Add random locations
            while (count--) {
                result.push(this.generateOneLocation(StarLocationType.PLANET, result, this.radius, random));
            }

            return result;
        }

        // Get the number of links to other stars
        getLinks(): StarLink[] {
            var result: StarLink[] = [];

            this.universe.starlinks.forEach((link: StarLink) => {
                if (link.first === this || link.second === this) {
                    result.push(link);
                }
            });

            return result;
        }

        private generateOneLocation(type: StarLocationType, others: StarLocation[], radius: number, random: RandomGenerator): StarLocation {
            var x = (random.throw(2) - 1) * radius;
            var y = (random.throw(2) - 1) * radius;
            return new StarLocation(this, type, x, y);
        }
    }
}

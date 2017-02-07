module TS.SpaceTac.Game {
    // A star system
    export class Star {

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

        // Base level for encounters in this system
        level: number;

        constructor(universe: Universe = null, x = 0, y = 0, name = "") {
            this.universe = universe || new Universe();
            this.x = x;
            this.y = y;
            this.radius = 0.1;
            this.locations = [new StarLocation(this, StarLocationType.STAR, 0, 0)];
            this.level = 1;
            this.name = name;
        }

        jasmineToString(): string {
            return `Star ${this.name}`;
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
            this.name = random.choice(Star.NAMES_POOL);
            this.generateLocations(location_count, random);
        }

        // Generate points of interest (*count* doesn't include the star and warp locations)
        generateLocations(count: number, random = new RandomGenerator()): void {
            while (count--) {
                this.generateOneLocation(StarLocationType.PLANET, this.locations, this.radius * 0.2, this.radius * 0.7, random);
            }
        }

        // Generate a warp location to another star (to be bound later)
        generateWarpLocationTo(other: Star, random = new RandomGenerator()): StarLocation {
            let fav_phi = Math.atan2(other.y - this.y, other.x - this.x);
            var warp = this.generateOneLocation(StarLocationType.WARP, this.locations, this.radius * 0.8, this.radius * 1, random, fav_phi);
            return warp;
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

        // Get the link to another star, null of not found
        getLinkTo(other: Star): StarLink | null {
            var result: StarLink | null = null;

            this.universe.starlinks.forEach(link => {
                if (link.isLinking(this, other)) {
                    result = link;
                }
            });

            return result;
        }

        // Get the warp location to another star, null if not found
        getWarpLocationTo(other: Star): StarLocation | null {
            var result: StarLocation | null = null;

            this.locations.forEach(location => {
                if (location.type == StarLocationType.WARP && location.jump_dest && location.jump_dest.star == other) {
                    result = location;
                }
            });

            return result;
        }

        // Find an unbound warp location to bind, null if none found
        findUnboundWarp(): StarLocation {
            var result: StarLocation = null;
            this.locations.forEach((location: StarLocation) => {
                if (location.type === StarLocationType.WARP && !location.jump_dest) {
                    result = location;
                }
            });
            return result;
        }

        // Check if a location is far enough from all other ones
        private checkMinDistance(loc: StarLocation, others: StarLocation[]): boolean {
            return others.every((iloc: StarLocation): boolean => {
                return iloc.getDistanceTo(loc) > this.radius * 0.15;
            });
        }

        // Generate a single location
        private generateOneLocation(type: StarLocationType, others: StarLocation[], radius_min: number, radius_max: number, random: RandomGenerator, fav_phi: number | null = null): StarLocation {
            do {
                var phi = fav_phi ? (fav_phi + random.throw(0.4) - 0.2) : random.throw(Math.PI * 2);
                var r = random.throw(radius_max - radius_min) + radius_min;
                var result = new StarLocation(this, type, r * Math.cos(phi), r * Math.sin(phi));
            } while (!this.checkMinDistance(result, others));

            this.locations.push(result);

            return result;
        }
    }
}

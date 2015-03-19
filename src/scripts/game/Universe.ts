/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    // Main game universe
    export class Universe extends Serializable {
        // Current connected player
        player: Player;

        // Currently played battle
        battle: Battle;

        // List of star systems
        stars: Star[];

        // List of links between star systems
        starlinks: StarLink[];

        // Radius of the universe
        radius: number;

        constructor() {
            super();

            this.stars = [];
            this.radius = 50;
        }

        // Load a game state from a string
        static loadFromString(serialized: string): Universe {
            var serializer = new Serializer();
            return <Universe>serializer.unserialize(serialized);
        }

        // Start a new "quick battle" game
        startQuickBattle(with_ai: boolean = false): void {
            this.battle = Game.Battle.newQuickRandom(with_ai);
            this.player = this.battle.fleets[0].player;
        }

        // Serializes the game state to a string
        saveToString(): string {
            var serializer = new Serializer();
            return serializer.serialize(this);
        }

        // Generates a universe, with star systems and such
        generate(starcount: number = 50, random: RandomGenerator = new RandomGenerator()): void {
            this.stars = [];
            this.starlinks = [];

            while (starcount) {
                var x = random.throw() * this.radius * 2.0 - this.radius;
                var y = random.throw() * this.radius * 2.0 - this.radius;
                var star = new Star(this, x, y);

                var nearest = this.getNearestTo(star);
                if (nearest && nearest.getDistanceTo(star) < this.radius * 0.1) {
                    continue;
                }

                this.stars.push(star);

                starcount--;
            }

            this.stars.forEach((first: Star) => {
                var second = this.getNearestTo(first);
                if (!this.areLinked(first, second)) {
                    this.starlinks.push(new StarLink(first, second));
                }
            });
        }

        // Get the star nearest to another
        getNearestTo(star: Star): Star {
            if (this.stars.length === 0) {
                return null;
            } else {
                var mindist = this.radius * 2.0;
                var nearest: Star = null;
                this.stars.forEach((istar: Star) => {
                    if (istar !== star) {
                    var dist = star.getDistanceTo(istar);
                        if (dist < mindist) {
                            nearest = istar;
                            mindist = dist;
                        }
                    }
                });
                return nearest;
            }
        }

        // Check if a link exists between two stars
        areLinked(first: Star, second: Star): boolean {
            var result = false;
            this.starlinks.forEach((link: StarLink) => {
                if (link.isLinking(first, second)) {
                    result = true;
                }
            });
            return result;
        }
    }
}

/// <reference path="Serializable.ts"/>

module TS.SpaceTac.Game {
    // An hyperspace link between two star systems
    export class StarLink extends Serializable {
        // Stars
        first: Star;
        second: Star;

        constructor(first: Star, second: Star) {
            super();

            this.first = first;
            this.second = second;
        }

        // Check if this links bounds the two stars together, in either way
        isLinking(first: Star, second: Star) {
            return (this.first === first && this.second === second) || (this.first === second && this.second === first);
        }

        // Get the length of a link
        getLength(): number {
            return this.first.getDistanceTo(this.second);
        }

        // Check if this link crosses another
        isCrossing(other: StarLink): boolean {
            if (this.first === other.first || this.second === other.first || this.first === other.second || this.second === other.second) {
                return false;
            }
            var ccw = (a: Star, b: Star, c: Star): boolean => {
                return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
            };
            var cc1 = ccw(this.first, other.first, other.second);
            var cc2 = ccw(this.second, other.first, other.second);
            var cc3 = ccw(this.first, this.second, other.first);
            var cc4 = ccw(this.first, this.second, other.second);
            return cc1 !== cc2 && cc3 !== cc4;
        }

        // Get the other side of the link, for a given side
        getPeer(star: Star): Star {
            if (star === this.first) {
                return this.second;
            } else if (star === this.second) {
                return this.first;
            } else {
                return null;
            }
        }
    }
}

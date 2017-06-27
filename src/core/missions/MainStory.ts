/// <reference path="Mission.ts" />

module TS.SpaceTac {
    function randomLocation(stars: Star[], excludes: StarLocation[] = []) {
        let random = RandomGenerator.global;
        let star = stars.length == 1 ? stars[0] : random.choice(stars);
        return RandomGenerator.global.choice(star.locations.filter(loc => !contains(excludes, loc)));
    }

    /**
     * Main story arc
     */
    export class MainStory extends Mission {
        constructor(universe: Universe, fleet: Fleet) {
            let random = RandomGenerator.global;
            let location = nn(fleet.location);

            super([
                new MissionPartGoTo(randomLocation([location.star], [location]), "Find your contact")
            ], true);
        }
    }
}

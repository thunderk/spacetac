module SpaceTac.Game {
    // One player (human or IA)
    export class Player {
        // Current fleet
        fleet: Fleet;

        // Create a player, with an empty fleet
        constructor() {
            this.fleet = new Fleet(this);
        }

        // Create a quick random player, with a fleet, for testing purposes
        static newQuickRandom(): Player {
            var player = new Player();
            return player;
        }
    }
}
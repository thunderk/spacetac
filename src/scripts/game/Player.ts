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
        static newQuickRandom(name: String): Player {
            var player = new Player();

            new Ship(player.fleet, name + "'s First");
            new Ship(player.fleet, name + "'s Second");
            new Ship(player.fleet, name + "'s Third");
            new Ship(player.fleet, name + "'s Fourth");

            return player;
        }
    }
}
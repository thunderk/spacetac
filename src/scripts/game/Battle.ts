module SpaceTac.Game {
    // A turn-based battle between fleets
    export class Battle {
        // List of fleets engaged in battle
        fleets: Fleet[];

        // List of ships, sorted by their initiative throw
        play_order: Ship[];

        // Create a battle between two fleets
        constructor(fleet1: Fleet, fleet2: Fleet) {
            this.fleets = [fleet1, fleet2];
            // TODO Initiative throws to set the play order
        }

        // Create a quick random battle, for testing purposes
        static newQuickRandom(): Battle {
            var player1 = Player.newQuickRandom();
            var player2 = Player.newQuickRandom();

            var result = new Battle(player1.fleet, player2.fleet);
            return result;
        }
    }
}
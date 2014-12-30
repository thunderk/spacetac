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
            this.play_order = [];
        }

        // Create play order, performing an initiative throw
        throwInitiative(gen: RandomGenerator) {
            var play_order: Ship[] = [];

            // Throw each ship's initiative
            this.fleets.forEach(function(fleet){
                fleet.ships.forEach(function(ship){
                    ship.throwInitiative(gen);
                    play_order.push(ship);
                });
            });

            // Sort by throw result
            play_order.sort(function(ship1: Ship, ship2: Ship) {
                return (ship2.initative_throw - ship1.initative_throw);
            });
            this.play_order = play_order;
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
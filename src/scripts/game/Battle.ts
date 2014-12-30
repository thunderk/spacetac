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
        throwInitiative(gen: RandomGenerator = new RandomGenerator()): void {
            var play_order: Ship[] = [];

            // Throw each ship's initiative
            this.fleets.forEach(function (fleet) {
                fleet.ships.forEach(function (ship) {
                    ship.throwInitiative(gen);
                    play_order.push(ship);
                });
            });

            // Sort by throw result
            play_order.sort(function (ship1: Ship, ship2: Ship) {
                return (ship2.initative_throw - ship1.initative_throw);
            });
            this.play_order = play_order;
        }

        // Defines the initial ship positions for one fleet
        //  x and y are the center of the fleet placement
        //  facing_angle is the forward angle in radians
        private placeFleetShips(fleet: Fleet, x: number, y: number, facing_angle: number): void {
            var side_angle = facing_angle + Math.PI * 0.5;
            var spacing = 50;
            var total_length = spacing * (fleet.ships.length - 1);
            var dx = Math.cos(side_angle);
            var dy = Math.sin(side_angle);
            x -= dx * total_length * 0.5;
            y -= dy * total_length * 0.5;
            for (var i = 0; i < fleet.ships.length; i++) {
                fleet.ships[i].setArenaPosition(x + i * dx * spacing, y + i * dy * spacing);
                fleet.ships[i].setArenaFacingAngle(facing_angle);
            }
        }

        // Defines the initial ship positions of all engaged fleets
        placeShips(): void {
            this.placeFleetShips(this.fleets[0], 100, 100, 0);
            this.placeFleetShips(this.fleets[1], 300, 100, Math.PI);
        }

        // Start the battle
        //  This will call all necessary initialization steps (initiative, placement...)
        start(): void {
            this.placeShips();
            this.throwInitiative();
        }

        // Create a quick random battle, for testing purposes
        static newQuickRandom(): Battle {
            var player1 = Player.newQuickRandom("John");
            var player2 = Player.newQuickRandom("Carl");

            var result = new Battle(player1.fleet, player2.fleet);
            result.start();
            return result;
        }
    }
}
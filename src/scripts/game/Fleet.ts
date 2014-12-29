module SpaceTac.Game {
    // A fleet of ships
    export class Fleet {
        // Fleet owner
        player: Player;

        // List of ships
        ships: Ship[];

        // Create a fleet, bound to a player
        constructor(player: Player) {
            this.player = player;
        }
    }
}
/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    // Main game universe
    export class Universe extends Serializable {
        // Current connected player
        player: Player;

        // Currently played battle
        battle: Battle;

        // Load a game state from a string
        static loadFromString(serialized: string): Universe {
            var serializer = new Serializer();
            return <Universe>serializer.unserialize(serialized);
        }

        // Start a new "quick battle" game
        startQuickBattle(): void {
            this.battle = Game.Battle.newQuickRandom(true);
            this.player = this.battle.fleets[0].player;
        }

        // Serializes the game state to a string
        saveToString(): string {
            var serializer = new Serializer();
            return serializer.serialize(this);
        }
    }
}

module SpaceTac.View {
    "use strict";

    // Utility functions for sounds
    export class Sound {

        // Play a ponctual sound
        static playOnce(game: Phaser.Game, key: string): void {
            if (game.sound.context) {
                game.sound.play("battle-ship-change");
            }
        }
    }
}

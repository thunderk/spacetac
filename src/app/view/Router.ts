module SpaceTac.View {
    "use strict";

    // Router to other states
    export class Router extends Phaser.State {
        create() {
            var universe = (<GameUI>this.game).universe;

            if (!universe) {
                // No universe, go back to main menu
                this.game.state.start("mainmenu", true, false);
            } else if (universe.battle) {
                // A battle is raging, go to it
                this.game.state.start("battle", true, false, universe.player, universe.battle);
            } else {
                // Go to the universe map
                this.game.state.start("universe", true, false, universe, universe.player);
            }
        }
    }
}

module SpaceTac.View {
    "use strict";

    // Router to other states
    export class Router extends Phaser.State {
        create() {
            var ui = <GameUI>this.game;
            var session = ui.session;

            if (!session) {
                // No universe, go back to main menu
                this.game.state.start("mainmenu", true, false);
            } else if (session.getBattle()) {
                // A battle is raging, go to it
                this.game.state.start("battle", true, false, session.player, session.getBattle());
            } else if (ui.getFocusedStar()) {
                // Go to the focused star system
                this.game.state.start("starsystem", true, false, ui.star, session.player);
            } else {
                // Go to the universe map
                this.game.state.start("universe", true, false, session.universe, session.player);
            }
        }
    }
}

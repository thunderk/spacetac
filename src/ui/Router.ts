module TK.SpaceTac.UI {
    // Router to other states
    export class Router extends Phaser.State {
        create() {
            var ui = <MainUI>this.game;
            var session = ui.session;

            if (!session) {
                // No session, go back to main menu
                this.game.state.start("mainmenu", true, false);
            } else if (session.getBattle()) {
                // A battle is raging, go to it
                this.game.state.start("battle", true, false, session.player, session.getBattle());
            } else if (session.hasUniverse()) {
                if (session.isFleetCreated()) {
                    // Go to the universe map
                    this.game.state.start("universe", true, false, session.universe, session.player);
                } else {
                    this.game.state.start("intro", true, false);
                }
            } else {
                // No battle, no universe, go back to menu
                this.game.state.start("mainmenu", true, false);
            }
        }
    }
}

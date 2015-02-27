module SpaceTac.View {
    "use strict";

    export class Main extends Phaser.State {
        create() {
            var universe = (<GameRouter>this.game).universe;

            if (universe.battle) {
                // A battle is raging, go to it
                this.game.state.start("battle", true, false, universe.player, universe.battle);
            }
        }
    }
}

module SpaceTac.View {
    "use strict";

    export class Main extends Phaser.State {
        create() {
            // Switch to a test battle
            var battle = Game.Battle.newQuickRandom();
            this.game.state.start("battle", true, false, battle.fleets[0].player, battle);
        }
    }
}

module SpaceTac.View {
    export class Main extends Phaser.State {

        create() {
            this.add.text(10, 10, "Let's code !", {font: "65px Arial"});

            // Switch to a test battle
            this.game.state.start("battle", true, false, Game.Battle.newQuickRandom());
        }
    }
}

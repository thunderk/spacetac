module TS.SpaceTac.UI {
    /**
     * Dialog to display battle outcome
     */
    export class OutcomeDialog extends Phaser.Image {
        constructor(parent: BattleView, player: Player, outcome: BattleOutcome) {
            super(parent.game, 0, 0, "battle-outcome-dialog");

            let victory = outcome.winner && (outcome.winner.player == player);
            let title = new Phaser.Image(this.game, 0, 0, victory ? "battle-outcome-title-victory" : "battle-outcome-title-defeat");
            title.anchor.set(0.5, 0.5);
            title.position.set(this.width / 2, 164);
            this.addChild(title);

            if (victory) {
                let button = new Phaser.Button(this.game, 344, 842, "battle-outcome-button-loot", () => {
                    // Open loot screen
                    if (outcome.winner) {
                        parent.character_sheet.show(outcome.winner.ships[0]);
                        parent.character_sheet.setLoot(outcome.loot);
                    }
                })
                parent.tooltip.bindStaticText(button, "Open character sheet to loot equipment from defeated fleet");
                this.addChild(button);

                button = new Phaser.Button(this.game, 766, 842, "battle-outcome-button-map", () => {
                    // Exit battle and go back to map
                    parent.exitBattle();
                });
                parent.tooltip.bindStaticText(button, "Exit the battle and go back to the map");
                this.addChild(button);
            } else {
                let button = new Phaser.Button(this.game, 344, 842, "battle-outcome-button-revert", () => {
                    // Revert just before battle
                    parent.revertBattle();
                });
                parent.tooltip.bindStaticText(button, "Go back to where the fleet was before the battle happened");
                this.addChild(button);

                button = new Phaser.Button(this.game, 766, 842, "battle-outcome-button-menu", () => {
                    // Quit the game, and go back to menu
                    parent.gameui.quitGame();
                });
                parent.tooltip.bindStaticText(button, "Quit the game, and go back to main menu");
                this.addChild(button);
            }
        }
    }
}

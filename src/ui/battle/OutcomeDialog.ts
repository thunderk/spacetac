/// <reference path="../common/UIDialog.ts" />

module TK.SpaceTac.UI {
    /**
     * Dialog to display battle outcome
     */
    export class OutcomeDialog extends UIDialog {
        battleview: BattleView
        player: Player
        outcome: BattleOutcome
        stats: BattleStats

        constructor(parent: BattleView, player: Player, outcome: BattleOutcome, stats: BattleStats) {
            super(parent);

            this.battleview = parent;
            this.player = player;
            this.outcome = outcome;
            this.stats = stats;

            this.refreshContent();
        }

        /**
         * Shortcut to add a single action button at the bottom of dialog
         */
        addActionButton(x: number, text: string, tooltip: string, action: Function) {
            let button = this.content.button("common-dialog-textbutton", x, 885, action, tooltip, undefined, {
                center: true,
                text: text,
                text_style: { color: "#d9e0e5" }
            });
        }

        /**
         * Refresh the whole dialog
         */
        refreshContent(): void {
            let parent = this.battleview;
            let outcome = this.outcome;
            let victory = outcome.winner && this.player.is(outcome.winner.player);

            this.content.clear();

            this.content.image(victory ? "battle-outcome-title-victory" : "battle-outcome-title-defeat", 747, 180, true);

            this.content.text("You", 815, 320, { color: "#ffffff", size: 20 });
            this.content.text("Enemy", 1015, 320, { color: "#ffffff", size: 20 });
            this.stats.getImportant(10).forEach((stat, index) => {
                this.content.text(stat.name, 530, 364 + 40 * index, { color: "#ffffff", size: 20 });
                this.content.text(stat.attacker.toString(), 815, 364 + 40 * index, { color: "#8ba883", size: 20, bold: true });
                this.content.text(stat.defender.toString(), 1015, 364 + 40 * index, { color: "#cd6767", size: 20, bold: true });
            });

            if (!this.battleview.session.hasUniverse()) {
                this.addActionButton(747, "Main menu", "Exit the battle and go back to the main menu", () => {
                    parent.exitBattle();
                });
            } else if (victory) {
                this.addActionButton(747, "Back to map", "Exit the battle and go back to the map", () => {
                    parent.exitBattle();
                });
            } else {
                this.addActionButton(535, "Revert battle", "Go back to where the fleet was before the battle happened", () => {
                    parent.revertBattle();
                });

                this.addActionButton(957, "Main menu", "Quit the game, and go back to main menu", () => {
                    parent.gameui.quitGame();
                });
            }
        }
    }
}

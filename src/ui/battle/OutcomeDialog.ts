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
            let button = this.addButton(x, 885, action, "common-dialog-textbutton", 0, 1, tooltip);
            button.addChild(this.addText(0, 0, text, "#d9e0e5"));
        }

        /**
         * Refresh the whole dialog
         */
        refreshContent(): void {
            let parent = this.battleview;
            let outcome = this.outcome;
            let victory = outcome.winner && (outcome.winner.player == this.player);

            this.clearContent();

            this.addImage(747, 180, victory ? "battle-outcome-title-victory" : "battle-outcome-title-defeat");

            this.addText(815, 320, "You", "#ffffff", 20);
            this.addText(1015, 320, "Enemy", "#ffffff", 20);
            this.stats.getImportant(10).forEach((stat, index) => {
                this.addText(530, 364 + 40 * index, stat.name, "#ffffff", 20);
                this.addText(815, 364 + 40 * index, stat.attacker.toString(), "#8ba883", 20, true);
                this.addText(1015, 364 + 40 * index, stat.defender.toString(), "#cd6767", 20, true);
            });

            if (!this.battleview.session.hasUniverse()) {
                this.addActionButton(747, "Main menu", "Exit the battle and go back to the main menu", () => {
                    parent.exitBattle();
                });
            } else if (victory) {
                if (this.outcome.loot.length) {
                    this.addActionButton(535, "Loot equipment", "Open character sheet to loot equipment from defeated fleet", () => {
                        let sheet = new CharacterSheet(this.view, undefined, undefined, () => {
                            sheet.destroy(true);
                            this.refreshContent();
                        });
                        sheet.show(this.player.fleet.ships[0], false, undefined, true);
                        sheet.setLoot(outcome.loot);
                        this.view.add.existing(sheet);
                    });

                    this.addActionButton(957, "Back to map", "Exit the battle and go back to the map", () => {
                        parent.exitBattle();
                    });
                } else {
                    this.addActionButton(747, "Back to map", "Exit the battle and go back to the map", () => {
                        parent.exitBattle();
                    });
                }
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

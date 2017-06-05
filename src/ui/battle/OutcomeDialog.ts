/// <reference path="../common/UIComponent.ts" />

module TS.SpaceTac.UI {
    /**
     * Dialog to display battle outcome
     */
    export class OutcomeDialog extends UIComponent {
        constructor(parent: BattleView, player: Player, outcome: BattleOutcome, stats: BattleStats) {
            super(parent, 1428, 1032, "battle-outcome-dialog");

            let victory = outcome.winner && (outcome.winner.player == player);
            this.addImage(714, 164, victory ? "battle-outcome-title-victory" : "battle-outcome-title-defeat");

            if (victory) {
                this.addButton(502, 871, () => {
                    parent.character_sheet.show(nn(outcome.winner).ships[0]);
                    parent.character_sheet.setLoot(outcome.loot);
                }, "battle-outcome-button-loot", 0, 0, "Open character sheet to loot equipment from defeated fleet");

                this.addButton(924, 871, () => {
                    parent.exitBattle();
                }, "battle-outcome-button-map", 0, 0, "Exit the battle and go back to the map");
            } else {
                this.addButton(502, 871, () => {
                    parent.revertBattle();
                }, "battle-outcome-button-revert", 0, 0, "Go back to where the fleet was before the battle happened");

                this.addButton(924, 871, () => {
                    // Quit the game, and go back to menu
                    parent.gameui.quitGame();
                }, "battle-outcome-button-menu", 0, 0, "Quit the game, and go back to main menu");
            }

            this.addText(780, 270, "You", "#ffffff", 20);
            this.addText(980, 270, "Enemy", "#ffffff", 20);
            stats.getImportant(10).forEach((stat, index) => {
                this.addText(500, 314 + 40 * index, stat.name, "#ffffff", 20);
                this.addText(780, 314 + 40 * index, stat.attacker.toString(), "#8ba883", 20, true);
                this.addText(980, 314 + 40 * index, stat.defender.toString(), "#cd6767", 20, true);
            });

            this.setPositionInsideParent(0.5, 0.5);
        }
    }
}

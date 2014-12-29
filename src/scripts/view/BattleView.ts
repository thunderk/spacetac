module SpaceTac.View {
    // Interactive view of a Battle
    export class BattleView extends Phaser.State {

        // Displayed battle
        battle: Game.Battle;

        // Init the view, binding it to a specific battle
        init(battle) {
            this.battle = battle;
        }

        // Create view graphics
        create() {
            this.game.stage.backgroundColor = 0x000000;
        }

        // Leaving the view, we unbind the battle
        shutdown() {
            this.battle = null;
        }
    }
}

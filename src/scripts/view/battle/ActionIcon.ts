module SpaceTac.View {
    // Icon to activate a ship capability (move, fire...)
    export class ActionIcon extends Phaser.Button {
        constructor(battleview: BattleView, x: number, y:number, code: string) {
            super(battleview.game, x, y, 'action-' + code);
        }
    }
}
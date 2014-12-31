module SpaceTac.View.Widgets {
    // Icon to activate a ship capability (move, fire...)
    export class CapabilityIcon extends Phaser.Button {
        constructor(battleview: BattleView, x: number, y:number, code: string) {
            super(battleview.game, x, y, 'capability-' + code);
        }
    }
}
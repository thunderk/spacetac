module SpaceTac.View {
    // Ship sprite in the arena (BattleView)
    export class ShipArenaSprite extends Phaser.Button {
        constructor(battleview: BattleView, ship: Game.Ship) {
            super(battleview.game, ship.arena_x, ship.arena_y, "arena-ship");

            this.scale.set(0.1, 0.1);
            this.rotation = ship.arena_angle;
            this.anchor.set(0.5, 0.5);

            battleview.arena.add(this);

            this.input.useHandCursor = true;
            this.onInputOver.add(() => {
                battleview.cursorOnShip(ship);
            });
            this.onInputOut.add(() => {
                battleview.cursorOffShip(ship);
            });
        }
    }
}

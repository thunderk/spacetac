module SpaceTac.View {
    // Graphical representation of a battle
    //  This is the area in the BattleView that will display ships with their real positions
    export class Arena extends Phaser.Group {
        background: Phaser.Image;
        private input_callback: any;

        constructor(battleview: BattleView) {
            super(battleview.game);

            var background = new Phaser.Image(battleview.game, 0, 0, 'ui-arena-background');
            background.scale.set(5, 5);
            background.inputEnabled = true;
            this.background = background;

            // Watch mouse move to capture hovering over background
            this.input_callback = this.game.input.addMoveCallback((pointer) => {
                var point = new Phaser.Point();
                if (battleview.game.input.hitTest(background, pointer, point)) {
                    battleview.cursorInSpace(point.x, point.y);
                }
            }, null);

            this.add(this.background);
        }

        destroy() {
            this.game.input.deleteMoveCallback(this.input_callback);
        }
    }
}

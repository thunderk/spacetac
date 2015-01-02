module SpaceTac.View {
    // Graphical representation of a battle
    //  This is the area in the BattleView that will display ships with their real positions
    export class Arena extends Phaser.Group {
        background: Phaser.Button;
        private input_callback: any;

        constructor(battleview: BattleView) {
            super(battleview.game);

            var background = new Phaser.Button(battleview.game, 0, 0, 'ui-arena-background');
            background.scale.set(5, 5);
            this.background = background;

            // Capture clicks on background
            background.onInputUp.add(() => {
                battleview.cursorClicked();
            });

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

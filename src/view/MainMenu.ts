/// <reference path="BaseView.ts"/>

module SpaceTac.View {
    "use strict";

    export class MainMenu extends BaseView {
        button_new_game: Phaser.Button;
        button_quick_battle: Phaser.Button;
        button_load_game: Phaser.Button;

        create() {
            // Title
            var text = new Phaser.Text(this.game, this.getMidWidth(), this.getHeight() * 0.4, "SpaceTac",
                {align: "center", font: "bold 42px Arial", fill: "#4050f2"});
            text.anchor.set(0.5, 0.5);
            this.add.existing(text);

            // Menu buttons
            var basex = this.getMidWidth();
            var y = Math.floor(this.getHeight() * 0.6);
            var space = this.getWidth() * 0.2;
            this.button_new_game = this.addButton(basex - space, y, "New Game", this.onNewGame);
            this.button_quick_battle = this.addButton(basex, y, "Quick Battle", this.onQuickBattle);
            this.button_load_game = this.addButton(basex + space, y, "Load Game", this.onLoadGame);
        }

        addButton(x: number, y: number, caption: string, callback: Function): Phaser.Button {
            var button = this.add.button(x, y, "menu-button", callback, this);
            button.anchor.set(0.5, 0.5);
            button.input.useHandCursor = true;

            var text = new Phaser.Text(this.game, 0, 0, caption,
                {align: "center", font: "bold 20px Arial", fill: "#303030"});
            text.anchor.set(0.5, 0.5);
            button.addChild(text);

            return button;
        }

        // Called when "New Game" is clicked
        onNewGame(): void {
            var gameui = <GameUI>this.game;

            gameui.session.startNewGame();

            this.game.state.start("router");
        }

        // Called when "Quick Battle" is clicked
        onQuickBattle(): void {
            var gameui = <GameUI>this.game;

            gameui.session.startQuickBattle(true);

            this.game.state.start("router");
        }

        // Called when "Load Game" is clicked
        onLoadGame(): void {
            var gameui = <GameUI>this.game;

            if (gameui.loadGame()) {
                this.game.state.start("router");
            } else {
                var error = this.game.add.text(this.button_load_game.x, this.button_load_game.y + 40,
                    "No saved game found",
                    {font: "bold 16px Arial", fill: "#e04040"});
                error.anchor.set(0.5, 0.5);
                var tween = this.game.tweens.create(error);
                tween.to({y: error.y + 100, alpha: 0}, 1000, Phaser.Easing.Exponential.In);
                tween.onComplete.addOnce(() => {
                    error.destroy();
                });
                tween.start();
            }
        }
    }
}

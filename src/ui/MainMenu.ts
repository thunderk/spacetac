/// <reference path="BaseView.ts"/>

module TS.SpaceTac.UI {
    export class MainMenu extends BaseView {
        layer_stars: Phaser.Group;
        layer_title: Phaser.Group;
        button_new_game: Phaser.Button;
        button_quick_battle: Phaser.Button;
        button_load_game: Phaser.Button;

        create() {
            super.create();

            this.layer_stars = this.addLayer();
            this.layer_title = this.addLayer();
            this.layer_title.x = 5000;

            // Stars
            for (let i = 0; i < 300; i++) {
                let fade = Math.random() * 0.5 + 0.5;
                let x = Math.random() * 0.998 + 0.001;
                let star = this.add.image(1920 * x, Math.random() * 1080, "menu-star", 0, this.layer_stars);
                star.anchor.set(0.5, 0.5);
                star.alpha = 0.7 * fade;
                star.scale.set(0.1 * fade, 0.1 * fade);
                this.tweens.create(star).to({ x: -30 }, 30000 * x / fade).to({ x: 1950 }, 0.00001).to({ x: 1920 * x }, 30000 * (1 - x) / fade).loop().start();
            }

            // Menu buttons
            this.button_new_game = this.addButton(322, 674, "New Game", "Start a new campaign in a generated universe", this.onNewGame);
            this.button_load_game = this.addButton(960, 674, "Load Game", "Load a saved campaign", this.onLoadGame);
            this.button_quick_battle = this.addButton(1606, 674, "Quick Battle", "Play a single generated battle", this.onQuickBattle);

            // Title
            let title = this.add.image(960, 225, "menu-title", 0, this.layer_title);
            title.anchor.set(0.5, 0);

            this.tweens.create(this.layer_title).to({ x: 0 }, 3000, Phaser.Easing.Circular.Out).start();
        }

        addButton(x: number, y: number, caption: string, tooltip: string, callback: Function): Phaser.Button {
            var button = this.add.button(x - 20, y + 20, "menu-button", callback, this, null, null, null, null, this.layer_title);
            button.anchor.set(0.5, 0);
            button.input.useHandCursor = true;

            var text = new Phaser.Text(this.game, 0, 76, caption,
                { align: "center", font: "bold 40pt Arial", fill: "#529aee" });
            text.anchor.set(0.5, 0.5);
            button.addChild(text);

            button.onInputOver.add(() => {
                button.loadTexture("menu-button-hover");
                text.fill = "#54b9ff";
            });
            button.onInputOut.add(() => {
                button.loadTexture("menu-button");
                text.fill = "#529aee";
            });

            this.tooltip.bindStaticText(button, tooltip);

            return button;
        }

        // Called when "New Game" is clicked
        onNewGame(): void {
            var gameui = <MainUI>this.game;

            gameui.session.startNewGame();

            this.game.state.start("router");
        }

        // Called when "Quick Battle" is clicked
        onQuickBattle(): void {
            var gameui = <MainUI>this.game;

            gameui.session.startQuickBattle(true);

            this.game.state.start("router");
        }

        // Called when "Load Game" is clicked
        onLoadGame(): void {
            var gameui = <MainUI>this.game;

            if (gameui.loadGame()) {
                this.game.state.start("router");
            } else {
                var error = this.game.add.text(this.button_load_game.x, this.button_load_game.y + 40,
                    "No saved game found",
                    { font: "bold 16px Arial", fill: "#e04040" });
                error.anchor.set(0.5, 0.5);
                var tween = this.game.tweens.create(error);
                tween.to({ y: error.y + 100, alpha: 0 }, 1000, Phaser.Easing.Exponential.In);
                tween.onComplete.addOnce(() => {
                    error.destroy();
                });
                tween.start();
            }
        }
    }
}

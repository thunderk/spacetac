/// <reference path="../BaseView.ts"/>

module TS.SpaceTac.UI {
    /**
     * Main menu (first interactive screen)
     */
    export class MainMenu extends BaseView {
        layer_stars: Phaser.Group;
        layer_title: Phaser.Group;
        button_new_game: Phaser.Button;
        button_quick_battle: Phaser.Button;
        button_load_game: Phaser.Button;
        dialog_load_game: LoadDialog;

        create() {
            super.create();

            this.layer_stars = this.addLayer("stars");
            this.layer_title = this.addLayer("title");

            // Stars
            for (let i = 0; i < 300; i++) {
                let fade = Math.random() * 0.5 + 0.5;
                let x = Math.random() * 0.998 + 0.001;
                let star = this.add.image(1920 * x, Math.random() * 1080, "common-particles", 32, this.layer_stars);
                star.anchor.set(0.5, 0.5);
                star.angle = 225;
                star.alpha = 0.7 * fade;
                star.scale.set(0.8 * fade, 0.8 * fade);
                this.tweens.create(star).to({ x: -30 }, 30000 * x / fade).to({ x: 1950 }, 0.00001).to({ x: 1920 * x }, 30000 * (1 - x) / fade).loop().start();
            }

            // Menu buttons
            this.button_new_game = this.addButton(322, 674, "New Game", "Start a new campaign in a generated universe", () => this.onNewGame());
            this.button_load_game = this.addButton(960, 674, "Load / Join", "Load a saved game or join a friend", () => this.onLoadGame());
            this.button_quick_battle = this.addButton(1606, 674, "Quick Battle", "Play a single generated battle", () => this.onQuickBattle());

            // Fullscreen button
            let button = new Phaser.Button(this.game, this.getWidth(), 0, "options-options", () => this.options.toggleBoolean("fullscreen"), null, 2, 2);
            button.anchor.set(1, 0);
            this.tooltip.bindStaticText(button, "Toggle full-screen");
            this.layer_title.add(button);

            // Title
            let title = this.add.image(960, 225, "menu-title", 0, this.layer_title);
            title.anchor.set(0.5, 0);

            // Dialogs
            this.dialog_load_game = new LoadDialog(this);
            this.dialog_load_game.setPosition(264, 160);
            this.dialog_load_game.moveToLayer(this.layer_title);
            this.dialog_load_game.setVisible(false);

            // Fading in
            this.tweens.create(this.layer_stars).from({ alpha: 0 }, 5000).start();
            this.layer_title.visible = false;
            let fading = this.timer.schedule(5000, () => {
                this.animations.show(this.layer_title, 1000);
            })
            this.input.onTap.addOnce(() => {
                this.timer.cancel(fading);
                this.animations.show(this.layer_title, 0);
            });

            this.gameui.audio.startMusic("supernatural");
        }

        addButton(x: number, y: number, caption: string, tooltip: string, callback: Function): Phaser.Button {
            var button = this.add.button(x - 20, y + 20, "menu-button", callback);
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

            this.layer_title.add(button);

            return button;
        }

        // Called when "New Game" is clicked
        onNewGame(): void {
            var gameui = <MainUI>this.game;

            gameui.session.startNewGame(false);

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
            this.dialog_load_game.setVisible(true);
        }
    }
}

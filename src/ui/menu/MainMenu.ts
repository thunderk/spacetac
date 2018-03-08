/// <reference path="../BaseView.ts"/>

module TK.SpaceTac.UI {
    /**
     * Main menu (first interactive screen)
     */
    export class MainMenu extends BaseView {
        static returned = false
        layer_stars!: Phaser.Group
        layer_presents!: Phaser.Group
        layer_title!: Phaser.Group
        button_new_game!: Phaser.Button
        button_quick_battle!: Phaser.Button
        button_load_game!: Phaser.Button
        dialog_load_game!: LoadDialog

        create() {
            super.create();

            let builder = new UIBuilder(this);

            this.layer_stars = this.getLayer("stars");
            this.layer_presents = this.getLayer("presents");
            this.layer_title = this.getLayer("title");

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

            // Presents...
            builder.in(this.layer_presents, builder => {
                builder.styled({ center: true }, builder => {
                    builder.text("Michael Lemaire", this.getMidWidth(), this.getHeight() * 0.4, { size: 32 });
                    builder.text("presents", this.getMidWidth(), this.getHeight() * 0.6, { size: 24 });
                });
            });

            // Menu buttons
            this.button_new_game = this.addButton(320, 730, "New Game", "Start a new campaign in a generated universe", () => this.onNewGame());
            this.button_load_game = this.addButton(958, 730, "Load / Join", "Load a saved game or join a friend", () => this.onLoadGame());
            this.button_quick_battle = this.addButton(1604, 730, "Quick Battle", "Play a single generated battle", () => this.onQuickBattle());

            // Fullscreen button
            let button = builder.in(this.layer_title).button("options-option-fullscreen", this.getWidth(), 0, () => this.options.toggleBoolean("fullscreen"), "Toggle full-screen");
            button.anchor.set(1, 0);

            // Title
            let title = builder.in(this.layer_title).image("menu-title", 274, 187);

            // Dialogs
            this.dialog_load_game = new LoadDialog(this);
            this.dialog_load_game.setPosition(286, 120);
            this.dialog_load_game.moveToLayer(this.layer_title);
            this.dialog_load_game.setVisible(false);

            // Animations
            this.layer_stars.visible = false;
            this.layer_presents.visible = false;
            this.layer_title.visible = false;
            this.animations.show(this.layer_presents, 500);
            this.animations.show(this.layer_stars, 5000);
            let fading = this.timer.schedule(5000, () => {
                this.animations.show(this.layer_title, 1000);
                this.animations.hide(this.layer_presents, 300);
            });
            let pass = () => {
                this.timer.cancel(fading);
                this.animations.show(this.layer_title, 0);
                this.animations.hide(this.layer_presents, 0);
            };
            if (MainMenu.returned) {
                pass();
            } else {
                this.input.onTap.addOnce(pass);
                MainMenu.returned = true;
            }

            this.gameui.audio.startMusic("supernatural");
        }

        addButton(x: number, y: number, caption: string, tooltip: string, callback: Function): Phaser.Button {
            let builder = new UIBuilder(this).in(this.layer_title);

            let result = builder.button("menu-button", x, y, callback, tooltip);
            result.anchor.set(0.5);

            builder.in(result).text(caption, 0, 0, { bold: true, size: 40, color: "#529aee" });

            return result;
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

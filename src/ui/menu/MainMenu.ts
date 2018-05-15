/// <reference path="../BaseView.ts"/>

module TK.SpaceTac.UI {
    /**
     * Main menu (first interactive screen)
     */
    export class MainMenu extends BaseView {
        static returned = false

        create() {
            super.create();

            let builder = new UIBuilder(this);

            // Layers
            let layer_background = this.getLayer("background");
            let layer_presents = this.getLayer("presents");
            let layer_title = this.getLayer("title");

            // Background
            builder.in(layer_background, builder => {
                builder.image("menu-background");
            });

            // Presents...
            builder.in(layer_presents, builder => {
                builder.styled({ center: true, color: "#FFFFFF", shadow: true }, builder => {
                    builder.text("Michael Lemaire", this.getMidWidth(), this.getHeight() * 0.4, { size: 32 });
                    builder.text("presents", this.getMidWidth(), this.getHeight() * 0.6, { size: 24 });
                });
            });

            builder.styled({ color: "#9fc4d6", size: 40, shadow: true }).in(layer_title, builder => {
                // Title
                let title = builder.in(layer_title).image("menu-title", 960, 784, true);

                // Buttons
                let group_new_game = builder.container("new-game", 0, 0, false);
                let group_load_game = builder.container("load-game", 0, 0, false);
                let group_join_game = builder.container("join-game", 0, 0, false);
                let group_skirmish = builder.in(group_new_game).container("skirmish", 0, 0, false);
                let button_new_game = builder.button("menu-button", 280, 106, undefined, "Start a new game", (on: boolean) => {
                    if (on) {
                        this.animations.show(group_new_game, 200);
                        button_load_game.toggle(false);
                        button_join_game.toggle(false);
                    } else {
                        this.animations.hide(group_new_game, 200);
                    }
                    return on;
                }, { text: "New game", center: true, on_bottom: true });
                let button_campaign = builder.in(group_new_game).button("menu-button", 770, 106, () => this.startCampaign(), "Start a campaign in story mode", undefined, {
                    text: "Campaign", center: true
                });
                let button_skirmish = builder.in(group_new_game).button("menu-button", 770, 266, undefined, "Start a quick battle", (on: boolean) => {
                    this.animations.setVisible(group_skirmish, on, 200);
                    return on;
                }, { text: "Skirmish", center: true, on_bottom: true });
                let button_skirmish_shipcount = this.addNumberSelector(builder.in(group_skirmish), 1130, 266, "Ships", 2, 5, 3);
                let button_skirmish_level = this.addNumberSelector(builder.in(group_skirmish), 1386, 266, "Level", 1, 10, 1);
                let button_skirmish_go = builder.in(group_skirmish).button("menu-button-small", 1632, 266, () => {
                    this.startSkirmish(button_skirmish_shipcount(), button_skirmish_level())
                }, "Start the skirmish with selected settings", undefined, { text: "Go", center: true });
                let button_load_game = builder.button("menu-button", 280, 266, undefined, "Load a previously saved game", (on: boolean) => {
                    if (on) {
                        this.animations.show(group_load_game, 200);
                        button_new_game.toggle(false);
                        button_join_game.toggle(false);
                    } else {
                        this.animations.hide(group_load_game, 200);
                    }
                    return on;
                }, { text: "Load game", center: true, on_bottom: true });
                builder.in(group_load_game, builder => {
                    let input = new InputSavegames(this, builder, 770, 266);
                    builder.button("menu-button-small", 1112, 266, () => input.load(), "Load the selected save game", undefined, {
                        text: "Go", center: true
                    });
                })
                let button_join_game = builder.button("menu-button", 280, 426, undefined, "Join a friend's game", (on: boolean) => {
                    if (on) {
                        this.animations.show(group_join_game, 200);
                        button_new_game.toggle(false);
                        button_load_game.toggle(false);
                    } else {
                        this.animations.hide(group_join_game, 200);
                    }
                    return on;
                }, { text: "Join game", center: true, on_bottom: true });
                builder.in(group_join_game, builder => {
                    let input = new InputInviteCode(this, builder, 770, 426);
                    builder.button("menu-button-small", 1112, 426, () => input.join(), "Join the game", undefined, {
                        text: "Go", center: true
                    });
                })
                let button_options = builder.button("menu-button-small", 1780, 106, () => this.showOptions(true), "Options", undefined, {
                    center: true,
                    icon: "menu-icon-options",
                });
            });

            // Animations
            layer_background.visible = false;
            layer_presents.visible = false;
            layer_title.visible = false;
            this.animations.show(layer_presents, 500);
            this.animations.show(layer_background, 5000);
            let fading = this.timer.schedule(5000, () => {
                this.animations.show(layer_title, 1000);
                this.animations.hide(layer_presents, 300);
            });
            let pass = () => {
                this.timer.cancel(fading);
                this.animations.show(layer_background, 0);
                this.animations.show(layer_title, 0);
                this.animations.hide(layer_presents, 0);
            };
            if (MainMenu.returned) {
                pass();
            } else {
                this.input.on("pointerup", pass);
                MainMenu.returned = true;
            }

            this.audio.startMusic("supernatural");
        }

        /**
         * Add a number selector in a given range
         */
        addNumberSelector(builder: UIBuilder, x: number, y: number, label: string, min: number, max: number, initial: number): () => number {
            let value = initial;
            builder.in(builder.image("menu-input-small", x, y + 30, true), builder => {
                let display = builder.text(`${value}`, 0, -32);
                builder.text(label, 0, 54, { color: "#6690a4", size: 28 });
                builder.button("menu-arrow-left", -68, -32, () => {
                    value = Math.max(min, value - 1);
                    builder.change(display, `${value}`);
                }, undefined, undefined, { center: true });
                builder.button("menu-arrow-right", 68, -32, () => {
                    value = Math.min(max, value + 1);
                    builder.change(display, `${value}`);
                }, undefined, undefined, { center: true });
            });
            return () => value;
        }

        /**
         * Start a campaign mode
         */
        startCampaign(): void {
            this.session.startNewGame(false);
            this.backToRouter();
        }

        /**
         * Start a skirmish
         */
        startSkirmish(shipcount: number, level: number): void {
            this.session.startQuickBattle(true, level, shipcount);
            this.backToRouter();
        }
    }
}

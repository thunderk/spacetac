/// <reference path="../BaseView.ts"/>

module SpaceTac.View {
    "use strict";

    // Interactive map of a star system
    export class StarSystemView extends BaseView {

        // Displayed star system
        star: Game.Star;

        // Interacting player
        player: Game.Player;

        // Group for the locations diplay
        locations: Phaser.Group;

        // Scaling used to transform game coordinates in screen ones
        private scaling: number;

        // Buttons
        private button_back: Phaser.Button;
        private button_jump: Phaser.Button;

        // Init the view, binding it to a universe
        init(star: Game.Star, player: Game.Player) {
            super.init();

            this.star = star;
            this.player = player;
        }

        // Create view graphics
        create() {
            super.create();

            this.locations = this.add.group();

            var display_margin = 50;
            var display_width = 720 - (display_margin * 2);
            this.scaling = display_width / (this.star.radius * 2);
            this.locations.position.set(display_margin + display_width / 2, display_margin + display_width / 2);
            this.locations.scale.set(this.scaling);

            // Buttons
            this.button_back = this.add.button(0, 0, "map-button-back", this.onBackClicked, this);
            this.button_back.input.useHandCursor = true;
            this.button_jump = this.add.button(150, 0, "map-button-jump", this.onJumpClicked, this);
            this.button_jump.input.useHandCursor = true;
            this.button_jump.visible = false;

            this.drawAll();

            this.gameui.audio.startMusic("walking-along");
        }

        // Leaving the view, unbind and destroy
        shutdown() {
            this.star = null;
            this.player = null;

            super.shutdown();
        }

        // Redraw the view
        drawAll(): void {
            this.locations.removeAll(true, true);

            // Draw location icons
            this.drawLocations();

            // Draw fleet
            if (this.player.fleet.location.star === this.star) {
                this.drawFleet();
            }

            // Buttons
            this.button_jump.visible = this.player.fleet.location.jump_dest !== null;
        }

        // Draw the fleet marker
        drawFleet(): void {
            var location = this.player.fleet.location;
            var fleet = this.add.sprite(location.x, location.y, "map-fleet-icon", 0, this.locations);
            fleet.scale.set(1.0 / this.scaling, 1.0 / this.scaling);
            fleet.anchor.set(0.5, -0.5);
            this.game.tweens.create(fleet).to({angle: -360}, 5000, undefined, true, 0, -1);
        }

        // Redraw the locations map
        drawLocations(): void {
            this.star.locations.forEach((location: Game.StarLocation) => {
                var key = "map-" + Game.StarLocationType[location.type].toLowerCase() + "-icon";
                var sprite = this.add.button(location.x, location.y, key);
                sprite.input.useHandCursor = true;
                sprite.onInputUp.addOnce(() => {
                    this.player.fleet.setLocation(location);

                    if (this.player.getBattle()) {
                        this.game.state.start("router", true, false);
                    } else {
                        this.drawAll();
                    }
                });
                sprite.scale.set(1.0 / this.scaling, 1.0 / this.scaling);
                sprite.anchor.set(0.5, 0.5);
                this.locations.addChild(sprite);
            });
        }

        // Called when "Back" is clicked, go back to universe map
        onBackClicked(): void {
            (<GameUI>this.game).star = null;
            this.game.state.start("router", true, false);
        }

        // Called when "jump" is clicked, initiate sector jump, and go back to universe map
        onJumpClicked(): void {
            this.player.fleet.jump();
            this.onBackClicked();
        }
    }
}

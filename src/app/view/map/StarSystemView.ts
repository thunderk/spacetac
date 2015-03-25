module SpaceTac.View {
    "use strict";

    // Interactive map of a star system
    export class StarSystemView extends Phaser.State {

        // Displayed star system
        star: Game.Star;

        // Interacting player
        player: Game.Player;

        // Group for the locations diplay
        locations: Phaser.Group;

        // Scaling used to transform game coordinates in screen ones
        private scaling: number;


        // Init the view, binding it to a universe
        init(star: Game.Star, player: Game.Player) {
            this.star = star;
            this.player = player;
        }

        // Create view graphics
        create() {
            this.locations = this.add.group();

            this.scaling = 720 / (this.star.radius * 2);
            this.locations.position.set(this.star.radius * this.scaling, this.star.radius * this.scaling);
            this.locations.scale.set(this.scaling);

            this.drawLocations();

            // Draw fleet location
            var location = this.player.fleet.location;
            var fleet = this.add.sprite(location.x, location.y, "map-fleet-icon", 0, this.locations);
            fleet.scale.set(1.0 / this.scaling, 1.0 / this.scaling);
            fleet.anchor.set(0.5, -0.5);
            this.game.tweens.create(fleet).to({angle: -360}, 5000, undefined, true, 0, -1);

            // Back button
            this.add.button(0, 0, "map-button-back", this.onBackClicked, this).input.useHandCursor = true;
        }

        // Leaving the view, unbind and destroy
        shutdown() {
            this.star = null;
            this.player = null;
        }

        // Redraw the locations map
        drawLocations(): void {
            this.locations.removeAll(true, true);
            this.star.locations.forEach((location: Game.StarLocation) => {
                var key = "map-" + Game.StarLocationType[location.type].toLowerCase() + "-icon";
                var sprite = this.add.sprite(location.x, location.y, key, 0, this.locations);
                sprite.scale.set(1.0 / this.scaling, 1.0 / this.scaling);
                sprite.anchor.set(0.5, 0.5);
            });
        }

        // Called when "Back" is clicked, go back to universe map
        onBackClicked(): void {
            this.game.state.start("universe", true, false, this.star.universe, this.player);
        }
    }
}

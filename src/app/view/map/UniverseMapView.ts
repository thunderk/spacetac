module SpaceTac.View {
    "use strict";

    // Interactive map of the universe
    export class UniverseMapView extends Phaser.State {

        // Displayed universe
        universe: Game.Universe;

        // Interacting player
        player: Game.Player;

        // Group for the stars and links
        private stars: Phaser.Group;

        // Scaling used to transform game coordinates in screen ones
        private scaling: number;

        // Init the view, binding it to a universe
        init(universe: Game.Universe, player: Game.Player) {
            this.universe = universe;
            this.player = player;
        }

        // Create view graphics
        create() {
            this.stars = this.add.group();

            this.scaling = 720 / (this.universe.radius * 2);
            this.stars.position.set(this.universe.radius * this.scaling, this.universe.radius * this.scaling);
            this.stars.scale.set(this.scaling);

            this.drawStars();

            var location = this.player.fleet.location.star;
            var fleet = this.add.sprite(location.x, location.y, "map-fleet-icon", 0, this.stars);
            fleet.scale.set(1.0 / this.scaling, 1.0 / this.scaling);
            fleet.anchor.set(0.5, -0.5);
            this.game.tweens.create(fleet).to({angle: -360}, 5000, undefined, true, 0, -1);

            // Inputs
            this.input.keyboard.addKey(Phaser.Keyboard.R).onUp.addOnce(this.revealAll, this);
        }

        // Leaving the view, unbind and destroy
        shutdown() {
            this.universe = null;
            this.player = null;
        }

        // Redraw the star map
        drawStars(): void {
            this.stars.removeAll(true, true);
            this.universe.starlinks.forEach((link: Game.StarLink) => {
                if (this.player.hasVisited(link.first) || this.player.hasVisited(link.second)) {
                    var line = this.add.graphics(0, 0, this.stars);
                    line.lineStyle(0.3, 0xA0A0A0);
                    line.moveTo(link.first.x, link.first.y);
                    line.lineTo(link.second.x, link.second.y);
                }
            });
            this.universe.stars.forEach((star: Game.Star) => {
                if (this.player.hasVisited(star)) {
                    var sprite = new Phaser.Button(this.game, star.x, star.y, "map-star-icon");
                    sprite.scale.set(1.0 / this.scaling, 1.0 / this.scaling);
                    sprite.anchor.set(0.5, 0.5);

                    sprite.onInputUp.add(() => {
                        this.game.state.start("starsystem", true, false, star, this.player);
                    });
                    sprite.input.useHandCursor = true;

                    this.stars.addChild(sprite);

                    var name = new Phaser.Text(this.game, star.x, star.y, star.name,
                        {align: "center", font: "bold 14px Arial", fill: "#90FEE3"});
                    name.scale.set(1.0 / this.scaling, 1.0 / this.scaling);
                    name.anchor.set(0.5, -0.4);
                    this.stars.addChild(name);
                }
            });
        }

        // Reveal the whole map (this is a cheat)
        revealAll(): void {
            console.warn("Cheat : reveal whole map");
            this.universe.stars.forEach((star: Game.Star) => {
                this.player.setVisited(star);
            });
            this.drawStars();
        }
    }
}

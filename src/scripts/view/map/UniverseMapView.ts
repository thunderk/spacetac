module SpaceTac.View {
    "use strict";

    // Interactive map of the universe
    export class UniverseMapView extends Phaser.State {

        // Displayed universe
        universe: Game.Universe;

        // Interacting player
        player: Game.Player;

        // Group for the stars and links
        stars: Phaser.Group;

        // Init the view, binding it to a universe
        init(universe: Game.Universe, player: Game.Player) {
            this.universe = universe;
            this.player = player;
        }

        // Create view graphics
        create() {
            this.stars = this.add.group();

            var scale = 720 / (this.universe.radius * 2);
            this.stars.position.set(this.universe.radius * scale, this.universe.radius * scale);
            this.stars.scale.set(scale);

            this.drawStars();

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
                    var sprite = this.add.sprite(star.x, star.y, "map-star-icon", 0, this.stars);
                    sprite.scale.set(0.1, 0.1);
                    sprite.anchor.set(0.5, 0.5);
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

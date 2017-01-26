/// <reference path="../BaseView.ts"/>

module TS.SpaceTac.View {
    // Interactive map of the universe
    export class UniverseMapView extends BaseView {
        // Displayed universe
        universe: Game.Universe;

        // Interacting player
        player: Game.Player;

        // Star systems
        group: Phaser.Group;
        starsystems: StarSystemDisplay[] = [];
        starlinks: Phaser.Graphics[] = [];

        // Zoom level
        zoom = 0;

        // Init the view, binding it to a universe
        init(universe: Game.Universe, player: Game.Player) {
            super.init();

            this.universe = universe;
            this.player = player;
        }

        // Create view graphics
        create() {
            super.create();

            this.group = new Phaser.Group(this.game);
            this.add.existing(this.group);

            this.starlinks = this.universe.starlinks.map(starlink => {
                let loc1 = starlink.first.getWarpLocationTo(starlink.second);
                let loc2 = starlink.second.getWarpLocationTo(starlink.first);

                let result = new Phaser.Graphics(this.game);
                result.lineStyle(0.005, 0x8bbeff);
                result.moveTo(starlink.first.x - 0.5 + loc1.x, starlink.first.y - 0.5 + loc1.y);
                result.lineTo(starlink.second.x - 0.5 + loc2.x, starlink.second.y - 0.5 + loc2.y);
                return result;
            });
            this.starlinks.forEach(starlink => this.group.addChild(starlink));

            this.starsystems = this.universe.stars.map(star => new StarSystemDisplay(this, star));
            this.starsystems.forEach(starsystem => this.group.addChild(starsystem));

            this.setZoom(2);
            this.add.button(1830, 100, "map-zoom-in", () => this.setZoom(this.zoom + 1)).anchor.set(0.5, 0.5);
            this.add.button(1830, 980, "map-zoom-out", () => this.setZoom(this.zoom - 1)).anchor.set(0.5, 0.5);

            this.gameui.audio.startMusic("walking-along");

            // Inputs
            this.inputs.bindCheat(Phaser.Keyboard.R, "Reveal whole map", this.revealAll);
        }

        // Leaving the view, unbind and destroy
        shutdown() {
            this.universe = null;
            this.player = null;

            super.shutdown();
        }

        // Reveal the whole map (this is a cheat)
        revealAll(): void {
            this.universe.stars.forEach((star: Game.Star) => {
                this.player.setVisited(star);
            });
            // TODO Redraw
        }

        // Set the camera to center on a target, and to display a given span in height
        setCamera(x: number, y: number, span: number) {
            let scale = 1000 / span;
            this.tweens.create(this.group.position).to({ x: 960 - x * scale, y: 540 - y * scale }, 500, Phaser.Easing.Cubic.InOut).start();
            this.tweens.create(this.group.scale).to({ x: scale, y: scale }, 500, Phaser.Easing.Cubic.InOut).start();
        }

        setZoom(level: number) {
            let current_star = this.player.fleet.location.star;
            if (level <= 0) {
                this.setCamera(0, 0, this.universe.radius * 2);
                this.zoom = 0;
            } else if (level == 1) {
                // TODO Zoom to next-jump accessible
                this.setCamera(current_star.x, current_star.y, this.universe.radius * 0.5);
                this.zoom = 1;
            } else {
                this.setCamera(current_star.x, current_star.y, current_star.radius * 2);
                this.zoom = 2;
            }
        }
    }
}

/// <reference path="../BaseView.ts"/>

module TS.SpaceTac.UI {
    /**
     * Interactive map of the universe
     */
    export class UniverseMapView extends BaseView {
        // Displayed universe
        universe = new Universe();

        // Interacting player
        player = new Player();

        // Star systems
        group: Phaser.Group;
        starsystems: StarSystemDisplay[] = [];
        starlinks: Phaser.Graphics[] = [];

        // Fleets
        player_fleet: FleetDisplay;

        // Button to jump to another system
        button_jump: Phaser.Button;

        // Character sheet
        character_sheet: CharacterSheet;

        // Zoom level
        zoom = 0;

        /**
         * Init the view, binding it to a universe
         */
        init(universe: Universe, player: Player) {
            super.init();

            this.universe = universe;
            this.player = player;
        }

        /**
         * Create view graphics
         */
        create() {
            super.create();

            this.group = new Phaser.Group(this.game);
            this.add.existing(this.group);

            this.starlinks = this.universe.starlinks.map(starlink => {
                let loc1 = starlink.first.getWarpLocationTo(starlink.second);
                let loc2 = starlink.second.getWarpLocationTo(starlink.first);

                let result = new Phaser.Graphics(this.game);
                if (loc1 && loc2) {
                    result.lineStyle(0.005, 0x8bbeff);
                    result.moveTo(starlink.first.x - 0.5 + loc1.x, starlink.first.y - 0.5 + loc1.y);
                    result.lineTo(starlink.second.x - 0.5 + loc2.x, starlink.second.y - 0.5 + loc2.y);
                }
                return result;
            });
            this.starlinks.forEach(starlink => this.group.addChild(starlink));

            this.player_fleet = new FleetDisplay(this, this.player.fleet);

            this.starsystems = this.universe.stars.map(star => new StarSystemDisplay(this, star));
            this.starsystems.forEach(starsystem => this.group.addChild(starsystem));

            this.group.addChild(this.player_fleet);

            this.button_jump = new Phaser.Button(this.game, 0, 0, "map-button-jump", () => this.doJump());
            this.button_jump.anchor.set(0.5, 0.5);
            this.button_jump.visible = false;
            this.group.addChild(this.button_jump);

            this.setZoom(2);
            this.add.button(1520, 100, "map-zoom-in", () => this.setZoom(this.zoom + 1)).anchor.set(0.5, 0.5);
            this.add.button(1520, 980, "map-zoom-out", () => this.setZoom(this.zoom - 1)).anchor.set(0.5, 0.5);

            this.character_sheet = new CharacterSheet(this, this.getWidth() - 307);
            this.character_sheet.show(this.player.fleet.ships[0], false);
            this.character_sheet.hide(false);
            this.add.existing(this.character_sheet);

            this.gameui.audio.startMusic("walking-along");

            // Inputs
            this.inputs.bindCheat(Phaser.Keyboard.R, "Reveal whole map", this.revealAll);
        }

        /**
         * Leaving the view, unbind and destroy
         */
        shutdown() {
            this.universe = new Universe();
            this.player = new Player();

            super.shutdown();
        }

        /**
         * Update info on all star systems (fog of war, available data...)
         */
        updateInfo(current_star: Star | null) {
            this.starsystems.forEach(system => system.updateInfo(this.zoom, system.starsystem == current_star));

            let location = this.player.fleet.location;
            if (location && location.type == StarLocationType.WARP && this.zoom >= 2) {
                let angle = Math.atan2(location.y, location.x);
                this.button_jump.scale.set(location.star.radius * 0.002, location.star.radius * 0.002);
                this.button_jump.position.set(location.star.x + location.x + 0.02 * Math.cos(angle), location.star.y + location.y + 0.02 * Math.sin(angle));
                Animation.setVisibility(this.game, this.button_jump, true, 300);
            } else {
                Animation.setVisibility(this.game, this.button_jump, false, 300);
            }
        }

        /**
         * Reveal the whole map (this is a cheat)
         */
        revealAll(): void {
            this.universe.stars.forEach(star => {
                star.locations.forEach(location => {
                    this.player.setVisited(location);
                });
            });
            // TODO Redraw
        }

        /**
         * Set the camera to center on a target, and to display a given span in height
         */
        setCamera(x: number, y: number, span: number, duration = 500, easing = Phaser.Easing.Cubic.InOut) {
            let scale = 1000 / span;
            this.tweens.create(this.group.position).to({ x: 800 - x * scale, y: 540 - y * scale }, duration, easing).start();
            this.tweens.create(this.group.scale).to({ x: scale, y: scale }, duration, easing).start();
        }

        /**
         * Set the current zoom level (0, 1 or 2)
         */
        setZoom(level: number) {
            let current_star = this.player.fleet.location ? this.player.fleet.location.star : null;
            if (!current_star || level <= 0) {
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

            this.updateInfo(current_star);
        }

        /**
         * Do the jump animation to another system
         */
        doJump() {
            if (this.player.fleet.location && this.player.fleet.location.type == StarLocationType.WARP && this.player.fleet.location.jump_dest) {
                Animation.setVisibility(this.game, this.button_jump, false, 300);

                let dest_location = this.player.fleet.location.jump_dest;
                let dest_star = dest_location.star;
                this.player_fleet.moveToLocation(dest_location, 3, duration => {
                    this.timer.schedule(duration / 2, () => this.updateInfo(dest_star));
                    this.setCamera(dest_star.x, dest_star.y, dest_star.radius * 2, duration, Phaser.Easing.Cubic.Out);
                });
            }
        }
    }
}

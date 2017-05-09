module TS.SpaceTac.UI {
    // Particle that is rotated to always face its ongoing direction
    class BulletParticle extends Phaser.Particle {
        update(): void {
            super.update();
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        }
    }

    interface Point {
        x: number;
        y: number;
    }

    /**
     * Visual effects renderer for weapons.
     */
    export class WeaponEffect {
        // Link to game
        private ui: MainUI;

        // Link to arena
        private arena: Arena;

        // Display group in which to display the visual effects
        private layer: Phaser.Group;

        // Firing ship
        private source: Target;

        // Targetted ship
        private destination: Target;

        // Weapon used
        private weapon: Equipment;

        // Effect in use
        private effect: Function;

        constructor(arena: Arena, source: Target, destination: Target, weapon: Equipment) {
            this.ui = arena.getGame();
            this.arena = arena;
            this.layer = arena.layer_weapon_effects;
            this.source = source;
            this.destination = destination;
            this.weapon = weapon;
            this.effect = this.getEffectForWeapon(weapon.code);
        }

        /**
         * Start the visual effect
         * 
         * Returns the duration of the effect.
         */
        start(): number {
            if (this.effect) {
                return this.effect();
            } else {
                return 0;
            }
        }

        /**
         * Get the function that will be called to start the visual effect
         */
        getEffectForWeapon(weapon: string): Function {
            switch (weapon) {
                case "gatlinggun":
                    return this.gunEffect.bind(this);
                default:
                    return this.defaultEffect.bind(this);
            }
        }

        /**
         * Add a shield impact effect on a ship
         */
        shieldImpactEffect(from: Point, ship: Point, delay: number, duration: number, particles = false) {
            let angle = Math.atan2(from.y - ship.y, from.x - ship.x);

            let effect = new Phaser.Image(this.ui, ship.x, ship.y, "battle-weapon-shield-impact");
            effect.alpha = 0;
            effect.rotation = angle;
            effect.anchor.set(0.5, 0.5);
            this.layer.addChild(effect);

            let tween1 = this.ui.add.tween(effect).to({ alpha: 1 }, 100).delay(delay);
            let tween2 = this.ui.add.tween(effect).to({ alpha: 0 }, 100).delay(duration);
            tween1.chain(tween2);
            tween2.onComplete.addOnce(() => effect.destroy());
            tween1.start();

            if (particles) {
                let emitter = this.ui.add.emitter(ship.x + Math.cos(angle) * 35, ship.y + Math.sin(angle) * 35, 30);
                emitter.minParticleScale = 0.7;
                emitter.maxParticleScale = 1.2;
                emitter.gravity = 0;
                emitter.makeParticles("battle-weapon-hot");
                emitter.setSize(10, 10);
                emitter.setRotation(0, 0);
                emitter.setXSpeed(-Math.cos(angle) * 20, -Math.cos(angle) * 80);
                emitter.setYSpeed(-Math.sin(angle) * 20, -Math.sin(angle) * 80);
                this.arena.battleview.timer.schedule(delay, () => emitter.start(false, 200, 30, duration * 0.8 / 30));
                this.layer.addChild(emitter);
            }
        }

        /**
         * Add a hull impact effect on a ship
         */
        hullImpactEffect(from: Point, ship: Point, delay: number, duration: number) {
            let angle = Math.atan2(from.y - ship.y, from.x - ship.x);

            let emitter = this.ui.add.emitter(ship.x + Math.cos(angle) * 10, ship.y + Math.sin(angle) * 10, 30);
            emitter.minParticleScale = 1.0;
            emitter.maxParticleScale = 2.0;
            emitter.gravity = 0;
            emitter.makeParticles("battle-weapon-hot");
            emitter.setSize(15, 15);
            emitter.setRotation(0, 0);
            emitter.setXSpeed(-Math.cos(angle) * 120, -Math.cos(angle) * 260);
            emitter.setYSpeed(-Math.sin(angle) * 120, -Math.sin(angle) * 260);
            this.arena.battleview.timer.schedule(delay, () => emitter.start(false, 200, 30, duration * 0.8 / 30));
            this.layer.addChild(emitter);
        }

        /**
         * Default firing effect
         */
        defaultEffect(): number {
            let missile = new Phaser.Image(this.ui, this.source.x, this.source.y, "battle-weapon-default");
            missile.anchor.set(0.5, 0.5);
            missile.rotation = this.source.getAngleTo(this.destination);
            this.layer.addChild(missile);

            let blast_radius = this.weapon.action.getBlastRadius(this.source.ship || new Ship());

            let tween = this.ui.tweens.create(missile);
            tween.to({ x: this.destination.x, y: this.destination.y }, 1000);
            tween.onComplete.addOnce(() => {
                missile.destroy();
                if (blast_radius > 0) {
                    let blast = new Phaser.Image(this.ui, this.destination.x, this.destination.y, "battle-weapon-blast");
                    let scaling = blast_radius * 2 / (blast.width * 0.9);
                    blast.anchor.set(0.5, 0.5);
                    blast.scale.set(0.001, 0.001);
                    let tween1 = this.ui.tweens.create(blast.scale).to({ x: scaling, y: scaling }, 1500, Phaser.Easing.Quintic.Out);
                    tween1.onComplete.addOnce(() => blast.destroy());
                    tween1.start();
                    let tween2 = this.ui.tweens.create(blast).to({ alpha: 0 }, 1450, Phaser.Easing.Quadratic.In);
                    tween2.start();
                    this.layer.addChild(blast);
                }
            });
            tween.start();

            if (blast_radius > 0) {
                let ships = this.arena.getBattle().collectShipsInCircle(this.destination, blast_radius);
                ships.forEach(ship => {
                    if (ship.getValue("shield") > 0) {
                        this.shieldImpactEffect(this.destination, { x: ship.arena_x, y: ship.arena_y }, 1200, 800);
                    } else {
                        this.hullImpactEffect(this.destination, { x: ship.arena_x, y: ship.arena_y }, 1200, 400);
                    }
                });
            }

            return 1000 + (blast_radius ? 1500 : 0);
        }

        /**
         * Submachine gun effect (quick chain of small bullets)
         */
        gunEffect(): number {
            this.ui.audio.playOnce("battle-weapon-bullets");

            let has_shield = this.destination.ship && this.destination.ship.getValue("shield") > 0;

            var dx = this.destination.x - this.source.x;
            var dy = this.destination.y - this.source.y;
            var angle = Math.atan2(dy, dx);
            var distance = Math.sqrt(dx * dx + dy * dy);
            var emitter = new Phaser.Particles.Arcade.Emitter(this.ui, this.source.x + Math.cos(angle) * 35, this.source.y + Math.sin(angle) * 35, 10);
            var speed = 2000;
            emitter.particleClass = BulletParticle;
            emitter.gravity = 0;
            emitter.setSize(5, 5);
            emitter.setRotation(0, 0);
            emitter.setXSpeed(Math.cos(angle) * speed, Math.cos(angle) * speed);
            emitter.setYSpeed(Math.sin(angle) * speed, Math.sin(angle) * speed);
            emitter.makeParticles(["battle-weapon-bullets"]);
            let guard = 50 + (has_shield ? 80 : 40);
            if (guard + 1 > distance) {
                guard = distance - 1;
            }
            emitter.start(false, 1000 * (distance - guard) / speed, 50, 10);
            this.layer.addChild(emitter);

            if (has_shield) {
                this.shieldImpactEffect(this.source, this.destination, 100, 800, true);
            } else {
                this.hullImpactEffect(this.source, this.destination, 100, 800);
            }

            return 1000;
        }
    }
}

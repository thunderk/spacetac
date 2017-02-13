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

        // Display group in which to display the visual effects
        private layer: Phaser.Group;

        // Firing ship
        private source: Target;

        // Targetted ship
        private destination: Target;

        // Weapon class code (e.g. GatlingGun, ...)
        private weapon: string;

        // Effect in use
        private effect: Function;

        constructor(arena: Arena, source: Target, destination: Target, weapon: string) {
            this.ui = arena.getGame();
            this.layer = arena.layer_weapon_effects;
            this.source = source;
            this.destination = destination;
            this.weapon = weapon;
            this.effect = this.getEffectForWeapon(weapon);
        }

        // Start the visual effect
        start(): void {
            if (this.effect) {
                this.effect.call(this);
            }
        }

        // Get the function that will be called to start the visual effect
        getEffectForWeapon(weapon: string): Function {
            switch (weapon) {
                case "gatlinggun":
                    return this.gunEffect;
                default:
                    return this.defaultEffect;
            }
        }

        /**
         * Add a shield impact effect on a ship
         */
        shieldImpactEffect(from: Point, ship: Point, delay: number, duration: number) {
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

            let emitter = this.ui.add.emitter(ship.x + Math.cos(angle) * 35, ship.y + Math.sin(angle) * 35, 30);
            emitter.minParticleScale = 0.7;
            emitter.maxParticleScale = 1.2;
            emitter.gravity = 0;
            emitter.makeParticles("battle-weapon-hot");
            emitter.setSize(10, 10);
            emitter.setRotation(0, 0);
            emitter.setXSpeed(-Math.cos(angle) * 20, -Math.cos(angle) * 80);
            emitter.setYSpeed(-Math.sin(angle) * 20, -Math.sin(angle) * 80);
            emitter.start(false, 200, 30, duration / 30);
            this.layer.addChild(emitter);
        }

        /**
         * Default firing effect
         */
        defaultEffect(): void {
            var missile = new Phaser.Sprite(this.ui, this.source.x, this.source.y, "battle-weapon-default");
            missile.anchor.set(0.5, 0.5);
            missile.rotation = this.source.getAngleTo(this.destination);
            this.layer.addChild(missile);

            var tween = this.ui.tweens.create(missile);
            tween.to({ x: this.destination.x, y: this.destination.y }, 1000);
            tween.onComplete.addOnce(() => {
                missile.destroy();
            });
            tween.start();
        }

        /**
         * Submachine gun effect (quick chain of small bullets)
         */
        gunEffect(): void {
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
            emitter.start(false, 1000 * (distance - 50 - (has_shield ? 80 : 40)) / speed, 50, 10);
            this.layer.addChild(emitter);

            if (has_shield) {
                this.shieldImpactEffect(this.source, this.destination, 100, 800);
            }
        }
    }
}

module TS.SpaceTac.UI {
    // Particle that is rotated to always face its ongoing direction
    class BulletParticle extends Phaser.Particle {
        update(): void {
            super.update();
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        }
    }

    // Renderer of visual effects for a weapon fire
    export class WeaponEffect {
        // Arena in which to display the effect
        private arena: Arena;

        // Firing ship
        private source: Target;

        // Targetted ship
        private destination: Target;

        // Weapon class code (e.g. GatlingGun, ...)
        private weapon: string;

        // Effect in use
        private effect: Function;

        constructor(arena: Arena, source: Target, destination: Target, weapon: string) {
            this.arena = arena;
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

        // Default firing effect (missile)
        private defaultEffect(): void {
            var missile = new Phaser.Sprite(this.arena.game, this.source.x, this.source.y, "battle-weapon-bullet");
            missile.anchor.set(0.5, 0.5);
            missile.scale.set(0.2, 0.2);
            missile.rotation = this.source.getAngleTo(this.destination);
            this.arena.addChild(missile);

            var tween = this.arena.game.tweens.create(missile);
            tween.to({ x: this.destination.x, y: this.destination.y }, 1000);
            tween.onComplete.addOnce(() => {
                missile.destroy();
            });
            tween.start();
        }

        // Submachine gun effect (small chain of bullets)
        private gunEffect(): void {
            this.arena.getGame().audio.playOnce("battle-weapon-bullets");

            var source = this.arena.toGlobal(new PIXI.Point(this.source.x, this.source.y));
            var destination = this.arena.toGlobal(new PIXI.Point(this.destination.x, this.destination.y));
            var dx = destination.x - source.x;
            var dy = destination.y - source.y;
            var angle = Math.atan2(dy, dx);
            var distance = Math.sqrt(dx * dx + dy * dy);
            var emitter = new Phaser.Particles.Arcade.Emitter(this.arena.game, source.x, source.y, 10);
            var speed = 5000;
            var scale = 0.1;
            emitter.particleClass = BulletParticle;
            emitter.gravity = 0;
            emitter.setRotation(0, 0);
            emitter.minParticleSpeed.set(Math.cos(angle) * speed, Math.sin(angle) * speed);
            emitter.maxParticleSpeed.set(Math.cos(angle) * speed, Math.sin(angle) * speed);
            emitter.minParticleScale = scale;
            emitter.maxParticleScale = scale;
            emitter.makeParticles(["battle-weapon-bullet"]);
            emitter.start(false, 1000 * distance / speed, 50, 10);
        }
    }
}

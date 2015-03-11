module SpaceTac.View {
    "use strict";

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
        private source: Game.Target;

        // Targetted ship
        private destination: Game.Target;

        // Weapon class code (e.g. GatlingGun, ...)
        private weapon: string;

        // Effect in use
        private effect: Function;

        constructor(arena: Arena, source: Game.Target, destination: Game.Target, weapon: string) {
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
            return this.defaultEffect;
        }

        // Default firing effect (bullets)
        private defaultEffect(): void {
            this.arena.game.sound.play("battle-weapon-bullets");

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

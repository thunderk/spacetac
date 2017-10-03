module TK.SpaceTac.UI {
    // Particle that is rotated to always face its ongoing direction
    class BulletParticle extends Phaser.Particle {
        update(): void {
            super.update();
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        }
    }

    /**
     * Visual effects renderer for weapons.
     */
    export class WeaponEffect {
        // Link to game
        private ui: MainUI

        // Link to arena
        private arena: Arena
        private view: BattleView

        // Timer to use
        private timer: Timer

        // Display group in which to display the visual effects
        private layer: Phaser.Group

        // Firing ship
        private ship: Ship
        private source: IArenaLocation

        // Target (ship or space)
        private target: Target
        private destination: IArenaLocation

        // Weapon used
        private weapon: Equipment

        // Effect in use
        private effect: Function

        constructor(arena: Arena, ship: Ship, target: Target, weapon: Equipment) {
            this.ui = arena.game;
            this.arena = arena;
            this.view = arena.view;
            this.timer = arena.view.timer;
            this.layer = arena.layer_weapon_effects;
            this.ship = ship;
            this.target = target;
            this.weapon = weapon;
            this.effect = this.getEffectForWeapon(weapon.code);

            this.source = this.getCoords(Target.newFromShip(this.ship));
            this.destination = this.getCoords(this.target);
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
         * Get the location of a target (as of current view, not as actual game state)
         */
        getCoords(target: Target): IArenaLocation {
            if (target.ship) {
                let sprite = this.arena.findShipSprite(target.ship);
                if (sprite) {
                    return sprite;
                } else {
                    return target.ship.location;
                }
            } else {
                return target;
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
        shieldImpactEffect(from: IArenaLocation, ship: IArenaLocation, delay: number, duration: number, particles = false) {
            let angle = Math.atan2(from.y - ship.y, from.x - ship.x);

            let effect = this.view.newImage("battle-effects-shield-impact", ship.x, ship.y);
            effect.alpha = 0;
            effect.rotation = angle;
            effect.anchor.set(0.5, 0.5);
            this.layer.add(effect);

            let tween1 = this.ui.add.tween(effect).to({ alpha: 1 }, 100).delay(delay);
            let tween2 = this.ui.add.tween(effect).to({ alpha: 0 }, 100).delay(duration);
            tween1.chain(tween2);
            tween2.onComplete.addOnce(() => effect.destroy());
            tween1.start();

            if (particles) {
                let image = this.view.getImageInfo("battle-effects-hot");
                let emitter = this.ui.add.emitter(ship.x + Math.cos(angle) * 35, ship.y + Math.sin(angle) * 35, 30);
                emitter.minParticleScale = 0.7;
                emitter.maxParticleScale = 1.2;
                emitter.gravity = 0;
                emitter.makeParticles(image.key, image.frame);
                emitter.setSize(10, 10);
                emitter.setRotation(0, 0);
                emitter.setXSpeed(-Math.cos(angle) * 20, -Math.cos(angle) * 80);
                emitter.setYSpeed(-Math.sin(angle) * 20, -Math.sin(angle) * 80);
                this.timer.schedule(delay, () => emitter.start(false, 200, 30, duration * 0.8 / 30));
                this.layer.add(emitter);
                this.timer.schedule(delay + duration + 5000, () => emitter.destroy());
            }
        }

        /**
         * Add a hull impact effect on a ship
         */
        hullImpactEffect(from: IArenaLocation, ship: IArenaLocation, delay: number, duration: number) {
            let angle = Math.atan2(from.y - ship.y, from.x - ship.x);

            let image = this.view.getImageInfo("battle-effects-hot");
            let emitter = this.ui.add.emitter(ship.x + Math.cos(angle) * 10, ship.y + Math.sin(angle) * 10, 30);
            emitter.minParticleScale = 1.0;
            emitter.maxParticleScale = 2.0;
            emitter.gravity = 0;
            emitter.makeParticles(image.key, image.frame);
            emitter.setSize(15, 15);
            emitter.setRotation(0, 0);
            emitter.setXSpeed(-Math.cos(angle) * 120, -Math.cos(angle) * 260);
            emitter.setYSpeed(-Math.sin(angle) * 120, -Math.sin(angle) * 260);
            this.timer.schedule(delay, () => emitter.start(false, 200, 30, duration * 0.8 / 30));
            this.layer.add(emitter);
            this.timer.schedule(delay + duration + 5000, () => emitter.destroy());
        }

        /**
         * Default firing effect
         */
        defaultEffect(): number {
            this.ui.audio.playOnce("battle-weapon-missile-launch");

            let missile = this.view.newImage("battle-effects-default", this.source.x, this.source.y);
            missile.anchor.set(0.5, 0.5);
            missile.rotation = arenaAngle(this.source, this.destination);
            this.layer.add(missile);

            let blast_radius = (this.weapon.action instanceof TriggerAction) ? this.weapon.action.blast : 0;

            let projectile_duration = arenaDistance(this.source, this.destination) * 1.5;
            let tween = this.ui.tweens.create(missile);
            tween.to({ x: this.destination.x, y: this.destination.y }, projectile_duration || 1);
            tween.onComplete.addOnce(() => {
                missile.destroy();
                if (blast_radius > 0) {
                    this.ui.audio.playOnce("battle-weapon-missile-explosion");

                    let blast = this.view.newImage("battle-effects-blast", this.destination.x, this.destination.y);
                    let scaling = blast_radius * 2 / (blast.width * 0.9);
                    blast.anchor.set(0.5, 0.5);
                    blast.scale.set(0.001, 0.001);
                    let tween1 = this.ui.tweens.create(blast.scale).to({ x: scaling, y: scaling }, 1500, Phaser.Easing.Quintic.Out);
                    tween1.onComplete.addOnce(() => blast.destroy());
                    tween1.start();
                    let tween2 = this.ui.tweens.create(blast).to({ alpha: 0 }, 1450, Phaser.Easing.Quadratic.In);
                    tween2.start();
                    this.layer.add(blast);
                }
            });
            tween.start();

            if (blast_radius > 0 && this.weapon.action instanceof TriggerAction) {
                if (any(this.weapon.action.effects, effect => effect instanceof DamageEffect)) {
                    let ships = this.arena.getShipsInCircle(new ArenaCircleArea(this.destination.x, this.destination.y, blast_radius));
                    ships.forEach(sprite => {
                        if (sprite.getValue("shield") > 0) {
                            this.shieldImpactEffect(this.target, sprite, 1200, 800);
                        } else {
                            this.hullImpactEffect(this.target, sprite, 1200, 400);
                        }
                    });
                }
            }

            return projectile_duration + (blast_radius ? 1500 : 0);
        }

        /**
         * Submachine gun effect (quick chain of small bullets)
         */
        gunEffect(): number {
            this.ui.audio.playOnce("battle-weapon-bullets");

            let sprite = this.target.ship ? this.arena.findShipSprite(this.target.ship) : null;
            let has_shield = sprite && sprite.getValue("shield") > 0;

            let angle = arenaAngle(this.source, this.target);
            let distance = arenaDistance(this.source, this.target);
            let image = this.view.getImageInfo("battle-effects-bullets");
            let emitter = this.ui.add.emitter(this.source.x + Math.cos(angle) * 35, this.source.y + Math.sin(angle) * 35, 10);
            let speed = 2000;
            emitter.particleClass = BulletParticle;
            emitter.gravity = 0;
            emitter.setSize(5, 5);
            emitter.setRotation(0, 0);
            emitter.setXSpeed(Math.cos(angle) * speed, Math.cos(angle) * speed);
            emitter.setYSpeed(Math.sin(angle) * speed, Math.sin(angle) * speed);
            emitter.makeParticles(image.key, image.frame);
            let guard = 50 + (has_shield ? 80 : 40);
            if (guard + 1 > distance) {
                guard = distance - 1;
            }
            emitter.start(false, 1000 * (distance - guard) / speed, 50, 10);
            this.layer.add(emitter);
            this.timer.schedule(5000, () => emitter.destroy());

            if (has_shield) {
                this.shieldImpactEffect(this.source, this.target, 100, 800, true);
            } else {
                this.hullImpactEffect(this.source, this.target, 100, 800);
            }

            return 1000;
        }
    }
}

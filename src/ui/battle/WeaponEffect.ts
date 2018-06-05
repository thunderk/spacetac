module TK.SpaceTac.UI {
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
        private layer: UIContainer

        // Builder for images
        private builder: UIBuilder

        // Firing ship
        private ship: Ship
        private source: IArenaLocation

        // Target (ship or space)
        private target: Target
        private destination: IArenaLocation

        // Weapon used
        private action: TriggerAction

        constructor(arena: Arena, ship: Ship, target: Target, action: TriggerAction) {
            this.ui = arena.game;
            this.arena = arena;
            this.view = arena.view;
            this.timer = arena.view.timer;
            this.layer = arena.layer_weapon_effects;
            this.builder = new UIBuilder(arena.view, this.layer);
            this.ship = ship;
            this.target = target;
            this.action = action;

            this.source = Target.newFromShip(this.ship);
            this.destination = this.target;
        }

        /**
         * Start the visual effect
         * 
         * Returns the duration of the effect.
         */
        start(): number {
            // Fire effect
            let effect = this.getEffectForWeapon(this.action.code, this.action);
            let duration = effect();

            // Damage effect
            let action = this.action;
            if (any(action.effects, effect => effect instanceof DamageEffect)) {
                let ships = action.getImpactedShips(this.ship, this.target, this.source);
                let source = action.blast ? this.target : this.source;
                let damage_duration = this.damageEffect(source, ships, duration * 0.4, this.action.code == "gatlinggun");
                duration = Math.max(duration, damage_duration);
            }

            return duration;
        }

        /**
         * Add a damage effect on ships impacted by a weapon
         */
        damageEffect(source: IArenaLocation, ships: Ship[], base_delay = 0, shield_flares = false): number {
            let duration = 0;

            // TODO For each ship, delay should depend on fire effect animation
            let delay = base_delay;

            ships.forEach(ship => {
                if (ship.getValue("shield") > 0) {
                    this.shieldImpactEffect(source, ship.location, delay, 800, shield_flares);
                    duration = Math.max(duration, delay + 800);
                } else {
                    this.hullImpactEffect(source, ship.location, delay, 400);
                    duration = Math.max(duration, delay + 400);
                }
            });

            return duration;
        }

        /**
         * Get the function that will be called to start the visual effect
         */
        getEffectForWeapon(weapon: string, action: TriggerAction): () => number {
            switch (weapon) {
                case "gatlinggun":
                    return () => this.gunEffect();
                case "prokhorovlaser":
                    let angle = arenaAngle(this.source, this.target);
                    let dangle = radians(action.angle) * 0.5;
                    return () => this.angularLaser(this.source, action.range, angle - dangle, angle + dangle);
                default:
                    return () => this.defaultEffect();
            }
        }

        /**
         * Add a shield impact effect on a ship
         */
        shieldImpactEffect(from: IArenaLocation, ship: IArenaLocation, delay: number, duration: number, particles = false) {
            let angle = Math.atan2(from.y - ship.y, from.x - ship.x);

            let effect = this.builder.image("battle-effects-shield-impact", ship.x, ship.y, true);
            effect.setAlpha(0);
            effect.setRotation(angle);

            let tween1 = this.view.animations.addAnimation(effect, { alpha: 1 }, 100, undefined, delay);
            let tween2 = this.view.animations.addAnimation(effect, { alpha: 0 }, 100, undefined, delay + duration);
            tween2.then(() => effect.destroy());

            if (particles) {
                this.timer.schedule(delay, () => {
                    this.builder.particles({
                        key: "battle-effects-hot",
                        source: { x: ship.x + Math.cos(angle) * 40, y: ship.y + Math.sin(angle) * 40, radius: 10 },
                        emitDuration: 500,
                        count: 50,
                        lifetime: 400,
                        fading: true,
                        direction: { minangle: Math.PI + angle - 0.3, maxangle: Math.PI + angle + 0.3 },
                        scale: { min: 0.7, max: 1.2 },
                        speed: { min: 20, max: 80 }
                    });
                });
            }
        }

        /**
         * Add a hull impact effect on a ship
         */
        hullImpactEffect(from: IArenaLocation, ship: IArenaLocation, delay: number, duration: number) {
            let angle = Math.atan2(from.y - ship.y, from.x - ship.x);

            this.builder.particles({
                key: "battle-effects-hot",
                source: { x: ship.x + Math.cos(angle) * 40, y: ship.y + Math.sin(angle) * 40, radius: 7 },
                emitDuration: 500,
                count: 50,
                lifetime: 400,
                fading: true,
                direction: { minangle: Math.PI + angle - 0.3, maxangle: Math.PI + angle + 0.3 },
                scale: { min: 1, max: 2 },
                speed: { min: 120, max: 260 }
            });
        }

        /**
         * Default firing effect
         */
        defaultEffect(): number {
            this.ui.audio.playOnce("battle-weapon-missile-launch");

            let missile = this.builder.image("battle-effects-default", this.source.x, this.source.y, true);
            missile.setRotation(arenaAngle(this.source, this.destination));

            let blast_radius = this.action.blast;

            let projectile_duration = arenaDistance(this.source, this.destination) * 1.5;
            this.view.animations.addAnimation(missile, { x: this.destination.x, y: this.destination.y }, projectile_duration || 1).then(() => {
                missile.destroy();
                if (blast_radius > 0) {
                    this.ui.audio.playOnce("battle-weapon-missile-explosion");

                    let blast = this.builder.image("battle-effects-blast", this.destination.x, this.destination.y, true);
                    let scaling = blast_radius * 2 / (blast.width * 0.9);
                    blast.setScale(0.001);
                    Promise.all([
                        this.view.animations.addAnimation(blast, { alpha: 0 }, 1450, "Quad.easeIn"),
                        this.view.animations.addAnimation(blast, { scaleX: scaling, scaleY: scaling }, 1500, "Quint.easeOut"),
                    ]).then(() => blast.destroy());
                }
            });

            return projectile_duration + (blast_radius ? 1500 : 0);
        }

        /**
         * Laser effect, scanning from one angle to the other
         */
        angularLaser(source: IArenaLocation, radius: number, start_angle: number, end_angle: number, speed = 1): number {
            let duration = 1000 / speed;

            this.view.audio.playOnce("battle-weapon-laser");

            let laser = this.builder.image("battle-effects-laser", source.x, source.y);
            laser.setOrigin(0, 0.5);
            laser.setRotation(start_angle);
            laser.setScale(radius / laser.width);
            let dest_angle = laser.rotation + angularDifference(laser.rotation, end_angle);
            this.view.animations.addAnimation(laser, { rotation: dest_angle }, duration).then(() => laser.destroy());

            return duration;
        }

        /**
         * Submachine gun effect (quick chain of small bullets)
         */
        gunEffect(): number {
            this.ui.audio.playOnce("battle-weapon-bullets");

            let target_ship = this.target.getShip(this.view.battle);
            let has_shield = target_ship && (target_ship.getValue("shield") > 0);

            let angle = arenaAngle(this.source, this.target);
            let distance = arenaDistance(this.source, this.target);
            let guard = 35 + (has_shield ? 80 : 40);
            if (guard + 1 > distance) {
                guard = distance - 1;
            }
            let speed = 2000;
            let duration = 500;
            let lifetime = 1000 * (distance - guard) / speed;
            this.builder.particles({
                key: "battle-effects-bullets",
                source: { x: this.source.x + Math.cos(angle) * 35, y: this.source.y + Math.sin(angle) * 35, radius: 3 },
                emitDuration: duration,
                count: 50,
                lifetime: lifetime,
                direction: { minangle: angle, maxangle: angle },
                scale: { min: 1, max: 1 },
                speed: { min: speed, max: speed },
                facing: ParticleFacingMode.ALWAYS
            });

            return lifetime;
        }
    }
}

module TK.SpaceTac.UI {
    type WeaponEffectInfo = {
        execution: (speed: number) => Promise<void>
        delay: (ship: Ship) => number
    }

    /**
     * Visual effects renderer for weapons.
     */
    export class WeaponEffect {
        // Link to view
        private view: BattleView

        // Timer to use
        private timer: Timer

        // Display group in which to display the visual effects
        private layer: UIContainer

        // Builder for images
        private builder: UIBuilder

        // Firing ship
        ship: Ship
        source: IArenaLocation

        // Target (ship or space)
        target: Target
        destination: IArenaLocation

        // Weapon used
        action: TriggerAction

        constructor(arena: Arena, ship: Ship, target: Target, action: TriggerAction) {
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
         */
        async start(speed: number): Promise<void> {
            if (!speed) {
                return;
            }

            // Fire effect
            let fire_effect = this.getEffectForWeapon(this.action.code, this.action);
            let promises = [fire_effect.execution(speed)];

            // Damage effect
            let action = this.action;
            if (any(action.effects, effect => effect instanceof DamageEffect)) {
                let ships = action.getImpactedShips(this.ship, this.target, this.source).map((ship): [Ship, number] => {
                    return [ship, fire_effect.delay(ship) / speed];
                });
                let source = action.blast ? this.target : this.source;
                promises.push(this.damageEffect(source, ships, speed, this.action.code == "gatlinggun"));
            }

            await Promise.all(promises);
        }

        /**
         * Add a damage effect on ships impacted by a weapon
         */
        async damageEffect(source: IArenaLocation, ships: [Ship, number][], speed = 1, shield_flares = false): Promise<void> {
            let promises = ships.map(([ship, delay]) => {
                return this.timer.sleep(delay).then(() => {
                    if (ship.getValue("shield") > 0) {
                        return this.shieldImpactEffect(source, ship.location, speed, shield_flares);
                    } else {
                        return this.hullImpactEffect(source, ship.location, speed);
                    }
                });
            });

            await Promise.all(promises);
        }

        /**
         * Get the function that will be called to start the visual effect
         */
        getEffectForWeapon(weapon: string, action: TriggerAction): WeaponEffectInfo {
            switch (weapon) {
                case "gatlinggun":
                    return this.bulletsEffect();
                case "prokhorovlaser":
                    return this.laserEffect();
                default:
                    return this.genericEffect();
            }
        }

        /**
         * Add a shield impact effect on a ship
         */
        async shieldImpactEffect(from: IArenaLocation, ship: IArenaLocation, speed = 1, particles = false): Promise<void> {
            let angle = Math.atan2(from.y - ship.y, from.x - ship.x);

            if (particles) {
                this.builder.particles({
                    key: "battle-effects-hot",
                    source: { x: ship.x + Math.cos(angle) * 40, y: ship.y + Math.sin(angle) * 40, radius: 10 },
                    emitDuration: 500 / speed,
                    count: 50,
                    lifetime: 400 / speed,
                    fading: true,
                    direction: { minangle: Math.PI + angle - 0.3, maxangle: Math.PI + angle + 0.3 },
                    scale: { min: 0.7, max: 1.2 },
                    speed: { min: 20 / speed, max: 80 / speed }
                });
            }

            let effect = this.builder.image("battle-effects-shield-impact", ship.x, ship.y, true);
            effect.setAlpha(0);
            effect.setRotation(angle);
            await this.view.animations.addAnimation(effect, { alpha: 1 }, 100 / speed, undefined);
            await this.timer.sleep(800 / speed);
            await this.view.animations.addAnimation(effect, { alpha: 0 }, 100 / speed, undefined);
            effect.destroy();
        }

        /**
         * Add a hull impact effect on a ship
         */
        async hullImpactEffect(from: IArenaLocation, ship: IArenaLocation, speed = 1): Promise<void> {
            let angle = Math.atan2(from.y - ship.y, from.x - ship.x);

            this.builder.particles({
                key: "battle-effects-hot",
                source: { x: ship.x + Math.cos(angle) * 40, y: ship.y + Math.sin(angle) * 40, radius: 7 },
                emitDuration: 500 / speed,
                count: 50,
                lifetime: 400 / speed,
                fading: true,
                direction: { minangle: Math.PI + angle - 0.3, maxangle: Math.PI + angle + 0.3 },
                scale: { min: 1, max: 2 },
                speed: { min: 120 / speed, max: 260 / speed }
            });

            return Promise.resolve();  // TODO
        }

        /**
         * Generic weapon effect
         */
        async genericExecutor(speed: number): Promise<void> {
            this.view.audio.playOnce("battle-weapon-missile-launch", speed);

            let missile = this.builder.image("battle-effects-default", this.source.x, this.source.y, true);
            missile.setRotation(arenaAngle(this.source, this.destination));

            let blast_radius = this.action.blast;

            let projectile_duration = (arenaDistance(this.source, this.destination) * 1.5) || 1;
            await this.view.animations.addAnimation(missile, { x: this.destination.x, y: this.destination.y }, projectile_duration / speed);
            missile.destroy();

            if (blast_radius > 0) {
                this.view.audio.playOnce("battle-weapon-missile-explosion", speed);

                let blast = this.builder.image("battle-effects-blast", this.destination.x, this.destination.y, true);
                let scaling = blast_radius * 2 / (blast.width * 0.9);
                blast.setScale(0.001);

                await Promise.all([
                    this.view.animations.addAnimation(blast, { alpha: 0 }, 1450 / speed, "Quad.easeIn"),
                    this.view.animations.addAnimation(blast, { scaleX: scaling, scaleY: scaling }, 1500 / speed, "Quint.easeOut"),
                ]);
                blast.destroy();
            }
        }

        private genericEffect(): WeaponEffectInfo {
            return {
                execution: speed => this.genericExecutor(speed),
                delay: ship => {
                    let result = (arenaDistance(this.source, this.destination) * 1.5) || 1;
                    if (this.action.blast) {
                        result += 300 * Phaser.Math.Easing.Quintic.Out(arenaDistance(this.destination, ship.location) / this.action.blast);
                    }
                    return result;
                }
            }
        }

        /**
         * Laser effect, scanning from one angle to the other
         */
        laserExecutor(speed: number): Promise<void> {
            let duration = 1000 / speed;
            let angle = arenaAngle(this.source, this.target);
            let dangle = radians(this.action.angle) * 0.5;

            this.view.audio.playOnce("battle-weapon-laser", speed);

            let laser = this.builder.image("battle-effects-laser", this.source.x, this.source.y);
            laser.setOrigin(0, 0.5);
            laser.setRotation(angle - dangle);
            laser.setScale(this.action.range / laser.width);
            let dest_angle = laser.rotation + angularDifference(laser.rotation, angle + dangle);
            return this.view.animations.addAnimation(laser, { rotation: dest_angle }, duration).then(() => laser.destroy());
        }

        private laserEffect(): WeaponEffectInfo {
            return {
                execution: speed => this.laserExecutor(speed),
                delay: ship => {
                    let angle = arenaAngle(this.source, this.target);
                    let span = radians(this.action.angle);
                    return 900 * Math.abs(angularDifference(angle - span * 0.5, arenaAngle(this.source, ship.location))) / span;
                }
            }
        }

        /**
         * Submachine gun effect (quick chain of small bullets)
         */
        bulletsExecutor(speed: number): Promise<void> {
            this.view.audio.playOnce("battle-weapon-bullets", speed);

            let target_ship = this.target.getShip(this.view.battle);
            let has_shield = target_ship && (target_ship.getValue("shield") > 0);

            let angle = arenaAngle(this.source, this.target);
            let distance = arenaDistance(this.source, this.target);
            let guard = 35 + (has_shield ? 80 : 40);
            if (guard + 1 > distance) {
                guard = distance - 1;
            }
            let duration = 500 / speed;
            let lifetime = (distance - guard) / (2 * speed);
            this.builder.particles({
                key: "battle-effects-bullets",
                source: { x: this.source.x + Math.cos(angle) * 35, y: this.source.y + Math.sin(angle) * 35, radius: 3 },
                emitDuration: duration,
                count: 50,
                lifetime: lifetime,
                direction: { minangle: angle, maxangle: angle },
                scale: { min: 1, max: 1 },
                speed: { min: 2000 / speed, max: 2000 / speed },
                facing: ParticleFacingMode.ALWAYS
            });

            return this.timer.sleep(lifetime);
        }

        private bulletsEffect(): WeaponEffectInfo {
            return {
                execution: speed => this.bulletsExecutor(speed),
                delay: ship => 2000 / arenaDistance(this.source, ship.location)
            }
        }
    }
}

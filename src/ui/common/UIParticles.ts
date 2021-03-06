module TK.SpaceTac.UI {
    export enum ParticleFacingMode {
        INITIAL = 1,
        ALWAYS = 2
    }

    export type ParticlesConfig = {
        // Key for the particle texture
        key: string,
        // Source of the particles
        source: { x: number, y: number, radius: number },
        // Total number of particles to emit
        count: number,
        // Duration of the emission of particles
        emitDuration: number
        // Lifespan of a single particle in milliseconds
        lifetime: number,
        // Fade the alpha during the lifespan
        fading?: boolean,
        // Direction of the particles for radial emission
        direction: { minangle: number, maxangle: number },
        // Scale of the emitted particles
        scale: { min: number, max: number }
        // Speed of the particles
        speed: { min: number, max: number }
        // Force the particle to face its direction
        facing?: ParticleFacingMode
    }

    /**
     * Override of phaser particle manager to fix some issues
     */
    export class UIParticleManager extends Phaser.GameObjects.Particles.ParticleEmitterManager {
        setScrollFactor() {
        }
        setAlpha() {
        }
    }

    /**
     * System to emit multiple particles of the same texture
     */
    export class UIParticles {
        constructor(private view: BaseView) {
        }

        /**
         * Emit a batch of particles
         * 
         * Returns the total duration in milliseconds
         */
        emit(config: ParticlesConfig, parent?: UIContainer): number {
            let manager = this.createManager(config.key, parent);
            let emitter = manager.createEmitter({});
            if (config.fading) {
                emitter.setAlpha({ start: 1, end: 0 });
            }
            emitter.setPosition(
                { min: config.source.x - config.source.radius, max: config.source.x + config.source.radius },
                { min: config.source.y - config.source.radius, max: config.source.y + config.source.radius },
            );
            emitter.setSpeed({ min: config.speed.min, max: config.speed.max });
            emitter.setRadial(true);
            emitter.setEmitterAngle({ min: degrees(config.direction.minangle), max: degrees(config.direction.maxangle) });
            emitter.setLifespan(config.lifetime);
            emitter.setFrequency(config.emitDuration / config.count, 1);
            emitter.setScale({ min: config.scale.min, max: config.scale.max });
            if (config.facing) {
                emitter.particleClass = <any>((config.facing == ParticleFacingMode.ALWAYS) ? FacingAlwaysParticle : FacingInitialParticle);
            }
            this.view.timer.schedule(config.emitDuration, () => emitter.on = false);
            this.view.timer.schedule(config.emitDuration + config.lifetime, () => manager.destroy());
            return config.emitDuration + config.lifetime;
        }

        /**
         * Async version of *emit*
         */
        emit_as(config: ParticlesConfig): Promise<void> {
            let duration = this.emit(config);
            return this.view.timer.sleep(duration);
        }

        /**
         * Create a new particle manager
         * 
         * Automatically called by *emit*.
         */
        createManager(key: string, parent?: UIContainer): UIParticleManager {
            let info = this.view.getImageInfo(key);
            let result = new UIParticleManager(this.view, info.key, info.frame, []);
            this.view.add.existing(result);
            if (parent) {
                parent.add(result);
            }
            return result;
        }
    }

    /**
     * Particle that is rotated to face its initial direction
     */
    export class FacingInitialParticle extends Phaser.GameObjects.Particles.Particle {
        fire(x: number, y: number): any {
            let result = super.fire(x, y);
            this.rotation = Math.atan2(this.velocityY, this.velocityX);
            return result;
        }
    }

    /**
     * Particle that is rotated to face its movement direction
     */
    export class FacingAlwaysParticle extends FacingInitialParticle {
        update(delta: any, step: any, processors: any): any {
            let result = super.update(delta, step, processors);
            this.rotation = Math.atan2(this.velocityY, this.velocityX);
            return result;
        }
    }
}
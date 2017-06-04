module TS.SpaceTac.UI {
    /**
     * Particle shapes
     */
    export enum ParticleShape {
        ROUND = 0,
        DISK_HALO = 1,
        TRAIL = 2,
        FLARE = 3
    }

    /**
     * Particle colors
     */
    export enum ParticleColor {
        WHITE = 0,
        BLACK = 1,
        GREY = 2,
        RED = 3,
        BLUE = 4,
        YELLOW = 5,
        GREEN = 6,
        CYAN = 7,
        MAGENTA = 8,
        BROWN = 9,
        VIOLET = 10,
        MARINE = 11,
        ORANGE = 12,
        YELLOWISH = 13,
        GREENISH = 14,
        BLUEISH = 15,
    }

    /**
     * Config for a single sub-particle
     */
    export class ParticleConfig {
        shape: ParticleShape
        color: ParticleColor
        scale: number
        alpha: number
        angle: number
        offsetx: number
        offsety: number

        constructor(shape = ParticleShape.ROUND, color = ParticleColor.WHITE, scale = 1, alpha = 1, angle = 0, offsetx = 0, offsety = 0) {
            this.shape = shape;
            this.color = color;
            this.scale = scale;
            this.alpha = alpha;
            this.angle = angle;
            this.offsetx = offsetx;
            this.offsety = offsety;
        }

        /**
         * Get a particle image for this config
         */
        getImage(game: Phaser.Game, scaling = 1, angle = 0): Phaser.Image {
            let frame = this.shape * 16 + this.color;
            let result = game.add.image(0, 0, "common-particles", frame);
            result.data.frame = frame;
            result.data.key = "common-particles";
            result.anchor.set(0.5);
            result.angle = angle + this.angle;
            result.alpha = this.alpha;
            result.scale.set(this.scale * scaling);
            result.position.set(this.offsetx * scaling, this.offsety * scaling);
            return result;
        }
    }

    /**
     * Builder of particles, composed of one or several sub particles
     */
    export class ParticleBuilder {
        view: BaseView

        constructor(view: BaseView) {
            this.view = view;
        }

        /**
         * Build a composed particle
         */
        build(configs: ParticleConfig[]): Phaser.Image {
            if (configs.length == 0) {
                return this.view.game.add.image(0, 0, "common-transparent");
            } else {
                let base = configs[0];
                let result = base.getImage(this.view.game, 1);
                configs.slice(1).forEach(config => {
                    let sub = config.getImage(this.view.game, 1 / base.scale, -base.angle);
                    result.addChild(sub);
                });
                return result;
            }
        }
    }
}
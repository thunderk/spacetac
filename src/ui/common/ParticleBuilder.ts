module TK.SpaceTac.UI {
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
        getImage(view: BaseView): UIImage {
            let frame = this.shape * 16 + this.color;
            let result = view.add.image(0, 0, "common-particles", frame);
            result.setDataEnabled();
            (<any>result.data).frame = frame;
            (<any>result.data).key = "common-particles";
            result.setAngle(this.angle);
            result.setAlpha(this.alpha);
            result.setScale(this.scale);
            result.setPosition(this.offsetx, this.offsety);
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
        build(configs: ParticleConfig[]): UIContainer {
            let result = this.view.add.container(0, 0);

            configs.forEach(config => {
                result.add(config.getImage(this.view));
            });

            return result;
        }
    }
}
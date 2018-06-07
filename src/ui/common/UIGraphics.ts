module TK.SpaceTac.UI {
    export interface UIGraphicsCircleOptions {
        center?: { x: number, y: number }
        radius: number
        fill?: { color: number, alpha?: number }
        border?: { color: number, width?: number, alpha?: number }
    }

    export interface UIGraphicsCirclePortionOptions extends UIGraphicsCircleOptions {
        angle: { start: number, span: number }
    }

    export interface UIGraphicsLineOptions {
        start: { x: number, y: number }
        end: { x: number, y: number }
        color: number,
        alpha?: number,
        width?: number
    }

    /**
     * UI component that supports drawing simple shapes (circles, lines...)
     */
    export class UIGraphics extends Phaser.GameObjects.Graphics {
        constructor(view: BaseView, name: string, visible = true, x = 0, y = 0) {
            super(view, {});
            this.setName(name);
            this.setVisible(visible);
            this.setPosition(x, y);
        }

        /**
         * Add a rectangle
         */
        addRectangle(shape: IBounded, color: number, border_width = 0, border_color?: number, alpha = 1): void {
            let rect = new Phaser.Geom.Rectangle(shape.x, shape.y, shape.width, shape.height);

            this.fillStyle(color, alpha);
            this.fillRectShape(rect);
            if (border_width && border_color) {
                this.lineStyle(border_width, border_color, alpha);
                this.strokeRectShape(rect);
            }
        }

        /**
         * Add a portion of circle
         */
        addCircleArc(options: UIGraphicsCirclePortionOptions): void {
            let x = options.center ? options.center.x : 0;
            let y = options.center ? options.center.y : 0;

            if (options.fill) {
                this.fillStyle(options.fill.color, options.fill.alpha);
                this.slice(x, y, options.radius, options.angle.start, options.angle.start + options.angle.span, false);
                this.fillPath();
            }

            if (options.border) {
                this.lineStyle(options.border.width || 1, options.border.color, options.border.alpha);
                this.slice(x, y, options.radius, options.angle.start, options.angle.start + options.angle.span, false);
                this.strokePath();
            }
        }

        /**
         * Add a full circle
         */
        addCircle(options: UIGraphicsCircleOptions): void {
            let x = options.center ? options.center.x : 0;
            let y = options.center ? options.center.y : 0;

            if (options.fill) {
                this.fillStyle(options.fill.color, options.fill.alpha);
                this.fillCircle(x, y, options.radius);
            }

            if (options.border) {
                this.lineStyle(options.border.width || 1, options.border.color, options.border.alpha);
                this.strokeCircle(x, y, options.radius);
            }
        }

        /**
         * Add a line
         */
        addLine(options: UIGraphicsLineOptions): void {
            this.beginPath();
            this.lineStyle(coalesce(options.width, 1), options.color, coalesce(options.alpha, 1));
            this.moveTo(options.start.x, options.start.y);
            this.lineTo(options.end.x, options.end.y);
            this.closePath();
            this.strokePath();
        }
    }
}

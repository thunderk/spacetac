module TK.SpaceTac.UI {
    /**
     * Drone sprite in the arena
     */
    export class ArenaDrone extends UIContainer {
        // Link to view
        view: BattleView

        // Link to displayed drone
        drone: Drone

        // Sprite
        sprite: UIButton

        // Radius
        radius: UIGraphics

        // Activation effect
        activation: UIGraphics

        constructor(battleview: BattleView, drone: Drone) {
            super(battleview);

            this.view = battleview;
            this.drone = drone;

            let builder = new UIBuilder(battleview, this);

            this.radius = builder.graphics("radius");
            this.radius.fillStyle(0xe9f2f9, 0.1);
            this.radius.fillCircle(0, 0, drone.radius);
            this.radius.lineStyle(2, 0xe9f2f9, 0.5);
            this.radius.strokeCircle(0, 0, drone.radius);

            this.activation = builder.graphics("activation", 0, 0, false);
            this.activation.fillStyle(0xe9f2f9, 0.0);
            this.activation.fillCircle(0, 0, drone.radius);
            this.activation.lineStyle(2, 0xe9f2f9, 0.7);
            this.activation.strokeCircle(0, 0, drone.radius);

            this.sprite = builder.button(`action-${drone.code}`, 0, 0, undefined, () => this.drone.getDescription(), undefined, { center: true });
            this.sprite.setScale(0.1, 0.1);
        }

        /**
         * Start the activation animation
         * 
         * Return the animation duration
         */
        setApplied(): number {
            this.activation.setScale(0.001, 0.001);
            this.activation.visible = true;
            let tween = this.view.animations.addAnimation(this.activation, { scaleX: 1, scaleY: 1 }, 500).then(() => this.activation.setVisible(false));
            return 500;
        }

        /**
         * Set the sprite as destroyed
         * 
         * Return the animation duration
         */
        setDestroyed(): number {
            this.view.animations.addAnimation<UIContainer>(this, { alpha: 0.3 }, 300, undefined, 200);
            this.view.animations.addAnimation(this.radius, { scaleX: 0, scaleY: 0 }, 500).then(() => this.destroy());
            return 500;
        }

        /**
         * Set the tactical mode display
         */
        setTacticalMode(active: boolean) {
            this.sprite.setScale(active ? 0.2 : 0.1);
        }
    }
}

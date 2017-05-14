module TS.SpaceTac.UI {
    /**
     * Drone sprite in the arena
     */
    export class ArenaDrone extends Phaser.Group {
        // Link to view
        view: BattleView;

        // Link to displayed drone
        drone: Drone;

        // Sprite
        sprite: Phaser.Button;

        // Radius
        radius: Phaser.Graphics;

        // Activation effect
        activation: Phaser.Graphics;

        // Destroyed state
        destroyed = false;

        constructor(battleview: BattleView, drone: Drone) {
            super(battleview.game);

            this.view = battleview;
            this.drone = drone;

            this.radius = new Phaser.Graphics(this.game, 0, 0);
            this.radius.lineStyle(2, 0xe9f2f9, 0.3);
            this.radius.beginFill(0xe9f2f9, 0.0);
            this.radius.drawCircle(0, 0, drone.radius * 2);
            this.radius.endFill();
            this.addChild(this.radius);

            this.activation = new Phaser.Graphics(this.game, 0, 0);
            this.activation.lineStyle(2, 0xe9f2f9, 0.7);
            this.activation.beginFill(0xe9f2f9, 0.0);
            this.activation.drawCircle(0, 0, drone.radius * 2);
            this.activation.endFill();
            this.activation.visible = false;
            this.addChild(this.activation);

            this.sprite = new Phaser.Button(this.game, 0, 0, `battle-actions-deploy-${drone.code}`);
            this.sprite.anchor.set(0.5, 0.5);
            this.sprite.scale.set(0.1, 0.1);
            this.addChild(this.sprite);

            this.view.tooltip.bindDynamicText(this.sprite, () => {
                return this.destroyed ? "" : this.drone.getDescription();
            });
        }

        /**
         * Start the activation animation
         * 
         * Return the animation duration
         */
        setApplied(): number {
            if (this.destroyed) {
                return 0;
            }

            this.activation.scale.set(0.001, 0.001);
            this.activation.visible = true;
            let tween = this.game.tweens.create(this.activation.scale).to({ x: 1, y: 1 }, 500);
            tween.onComplete.addOnce(() => this.activation.visible = false);
            tween.start();
            return 500;
        }

        /**
         * Set the sprite as destroyed
         */
        setDestroyed() {
            this.destroyed = true;

            this.game.tweens.create(this).to({ alpha: 0.3 }, 300).delay(200).start();

            let tween = this.game.tweens.create(this.radius.scale).to({ x: 0, y: 0 }, 500);
            tween.onComplete.addOnce(() => {
                this.radius.destroy();
                this.activation.destroy();
            });
            tween.start();
        }
    }
}

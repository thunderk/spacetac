module TS.SpaceTac.View {
    /**
     * Drone sprite in the arena
     */
    export class ArenaDrone extends Phaser.Group {
        // Link to displayed drone
        drone: Game.Drone;

        // Sprite
        sprite: Phaser.Button;

        // Radius
        radius: Phaser.Graphics;

        constructor(battleview: BattleView, drone: Game.Drone) {
            super(battleview.game);

            this.drone = drone;

            this.radius = new Phaser.Graphics(this.game, 0, 0);
            this.radius.lineStyle(3, 0xe9f2f9, 0.5);
            this.radius.beginFill(0xe9f2f9, 0.0);
            this.radius.drawCircle(0, 0, drone.radius * 2);
            this.radius.endFill();
            this.addChild(this.radius);

            this.sprite = new Phaser.Button(this.game, 0, 0, `battle-actions-deploy-${drone.code}`);
            this.sprite.anchor.set(0.5, 0.5);
            this.sprite.scale.set(0.1, 0.1);
            this.addChild(this.sprite);
        }
    }
}

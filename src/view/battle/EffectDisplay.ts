module SpaceTac.View {
    // Icon to display an effect currently applied on a ship
    export class EffectDisplay extends Phaser.Image {
        constructor(game: Phaser.Game, effect: Game.TemporaryEffect) {
            var key = "battle-effect-" + effect.getFullCode();
            super(game, 0, 0, key, 0);

            var style = {font: "bold 12px Arial", fill: "#d0d020"};
            var duration = new Phaser.Text(this.game, 0, 0, effect.duration.toString(), style);
            this.addChild(duration);
        }
    }
}

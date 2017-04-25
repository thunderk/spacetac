module TS.SpaceTac.UI {
    // One item in a ship list (used in BattleView)
    export class ShipListItem extends Phaser.Button {
        // Reference to the view
        view: BattleView;

        // Reference to the ship game object
        ship: Ship;

        // Hull display
        hull: ValueBar;

        // Shield display
        shield: ValueBar;

        // Power display
        power: ValueBar;

        // Portrait
        layer_portrait: Phaser.Image;

        // Damage flashing indicator
        layer_damage: Phaser.Image;

        // Hover indicator
        layer_hover: Phaser.Image;

        // Active effects group
        active_effects: Phaser.Group;

        // Create a ship button for the battle ship list
        constructor(list: ShipList, x: number, y: number, ship: Ship, owned: boolean) {
            super(list.battleview.game, x, y, owned ? "battle-shiplist-own" : "battle-shiplist-enemy");
            this.view = list.battleview;

            this.ship = ship;

            this.active_effects = new Phaser.Group(this.game);
            this.addChild(this.active_effects);

            this.layer_portrait = new Phaser.Image(this.game, 8, 8, "ship-" + ship.model.code + "-portrait", 0);
            this.layer_portrait.scale.set(0.3, 0.3);
            this.addChild(this.layer_portrait);

            this.layer_damage = new Phaser.Image(this.game, 8, 8, "battle-shiplist-damage", 0);
            this.layer_damage.alpha = 0;
            this.addChild(this.layer_damage);

            this.layer_hover = new Phaser.Image(this.game, 5, 5, "battle-arena-ship-hover", 0);
            this.layer_hover.visible = false;
            this.addChild(this.layer_hover);

            this.hull = ValueBar.newStyled(this.game, "battle-shiplist-hull", 90, 39, true);
            this.addChild(this.hull);

            this.shield = ValueBar.newStyled(this.game, "battle-shiplist-shield", 98, 39, true);
            this.addChild(this.shield);

            this.power = ValueBar.newStyled(this.game, "battle-shiplist-energy", 106, 39, true);
            this.addChild(this.power);

            this.updateAttributes();
            this.updateEffects();

            let level = new Phaser.Text(this.game, 103, 22, `${ship.level.get()}`, { align: "center", font: "bold 10pt Arial", fill: "#000000" });
            level.anchor.set(0.5, 0.5);
            this.addChild(level);

            Tools.setHoverClick(this, () => list.battleview.cursorOnShip(ship), () => list.battleview.cursorOffShip(ship), () => list.battleview.cursorClicked());
        }

        // Update attributes from associated ship
        updateAttributes() {
            this.hull.setValue(this.ship.values.hull.get(), this.ship.attributes.hull_capacity.get());
            this.shield.setValue(this.ship.values.shield.get(), this.ship.attributes.shield_capacity.get());
            this.power.setValue(this.ship.values.power.get(), this.ship.attributes.power_capacity.get());
        }

        // Update effects applied on the ship
        updateEffects() {
            this.active_effects.removeAll(true);
            var count = this.ship.sticky_effects.length;
            var spacing = (8 * (count - 1) > 72) ? 72 / (count - 1) : 8;
            this.ship.sticky_effects.forEach((effect, index) => {
                var x = 46 - (count - 1) * spacing / 2 + index * spacing;
                var badge = new Phaser.Image(this.game, x, 46, `battle-shiplist-effect-${effect.isBeneficial() ? "good" : "bad"}`);
                badge.anchor.set(0.5, 0.5);
                this.active_effects.addChild(badge);
            });
        }

        // Flash a damage indicator
        setDamageHit() {
            this.game.tweens.create(this.layer_damage).to({ alpha: 1 }, 100).to({ alpha: 0 }, 150).repeatAll(2).start();
        }

        // Move to a given location on screen
        moveTo(x: number, y: number, animate: boolean) {
            if (animate) {
                var tween = this.game.tweens.create(this);
                tween.to({ x: x, y: y });
                tween.start();
            } else {
                this.x = x;
                this.y = y;
            }
        }

        // Set the hovered status
        setHovered(hovered: boolean) {
            this.view.animations.setVisible(this.layer_hover, hovered, 200);
        }
    }
}

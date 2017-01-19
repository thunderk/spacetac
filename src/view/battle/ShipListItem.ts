module SpaceTac.View {
    // One item in a ship list (used in BattleView)
    export class ShipListItem extends Phaser.Button {
        // Reference to the ship game object
        ship: Game.Ship;

        // Energy display
        energy: ValueBar;

        // Hull display
        hull: ValueBar;

        // Shield display
        shield: ValueBar;

        // Portrait
        layer_portrait: Phaser.Image;

        // Damage flashing indicator
        layer_damage: Phaser.Image;

        // Hover indicator
        layer_hover: Phaser.Image;

        // Active effects group
        active_effects: Phaser.Group;

        // Create a ship button for the battle ship list
        constructor(list: ShipList, x: number, y: number, ship: Game.Ship, owned: boolean) {
            super(list.battleview.game, x, y, owned ? "battle-shiplist-own" : "battle-shiplist-enemy");

            this.ship = ship;

            this.layer_portrait = new Phaser.Image(this.game, 8, 8, "ship-" + ship.model + "-portrait", 0);
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

            this.energy = ValueBar.newStyled(this.game, "battle-shiplist-energy", 106, 39, true);
            this.addChild(this.energy);

            this.active_effects = new Phaser.Group(this.game);
            this.addChild(this.active_effects);

            this.updateAttributes();
            this.updateEffects();

            Tools.setHoverClick(this, () => list.battleview.cursorOnShip(ship), () => list.battleview.cursorOffShip(ship), () => list.battleview.cursorClicked());
        }

        // Update attributes from associated ship
        updateAttributes() {
            this.attributeChanged(this.ship.hull);
            this.attributeChanged(this.ship.shield);
            this.attributeChanged(this.ship.ap_current);
        }

        // Update effects applied on the ship
        updateEffects() {
            this.active_effects.removeAll(true);
            var count = this.ship.temporary_effects.length;
            var spacing = (8 * (count - 1) > 72) ? 72 / (count - 1) : 8;
            this.ship.temporary_effects.forEach((effect, index) => {
                var x = 46 - (count - 1) * spacing / 2 + index * spacing;
                var badge = new Phaser.Image(this.game, x, 85, `battle-shiplist-effect-${effect.isBeneficial() ? "good" : "bad"}`);
                badge.anchor.set(0.5, 0.5);
                this.active_effects.addChild(badge);
            });
        }

        // Called when an attribute for this ship changed through the battle log
        attributeChanged(attribute: Game.Attribute): void {
            if (attribute.code === Game.AttributeCode.Hull) {
                this.hull.setValue(attribute.current, attribute.maximal);
            } else if (attribute.code === Game.AttributeCode.Shield) {
                this.shield.setValue(attribute.current, attribute.maximal);
            } else if (attribute.code === Game.AttributeCode.AP) {
                this.energy.setValue(attribute.current, attribute.maximal);
            }
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
            Animation.setVisibility(this.game, this.layer_hover, hovered, 200);
        }
    }
}

module SpaceTac.View {
    "use strict";

    // One item in a ship list (used in BattleView)
    export class ShipListItem extends Phaser.Button {
        // Reference to the ship game object
        ship: Game.Ship;

        // Hull display
        hull: ValueBar;

        // Shield display
        shield: ValueBar;

        // Base display
        layer_base: Phaser.Image;

        // Portrait
        layer_portrait: Phaser.Image;

        // Hover indicator
        layer_hover: Phaser.Image;

        // Active effects group
        active_effects: Phaser.Group;

        // Create a ship button for the battle ship list
        constructor(list: ShipList, x: number, y: number, ship: Game.Ship, owned: boolean) {
            this.ship = ship;

            super(list.battleview.game, x, y, owned ? "battle-shiplist-own" : "battle-shiplist-enemy");

            this.input.useHandCursor = true;
            this.onInputOver.add(() => {
                list.battleview.cursorOnShip(ship);
            });
            this.onInputOut.add(() => {
                list.battleview.cursorOffShip(ship);
            });

            this.layer_base = new Phaser.Image(this.game, 0, 0, "battle-shiplist-base", 0);
            this.addChild(this.layer_base);

            this.layer_portrait = new Phaser.Image(this.game, 30, 30, "ship-scout-portrait", 0);
            this.layer_portrait.anchor.set(0.5, 0.5);
            this.addChild(this.layer_portrait);

            this.layer_hover = new Phaser.Image(this.game, 30, 30, "battle-arena-shipspritehover", 0);
            this.layer_hover.anchor.set(0.5, 0.5);
            this.layer_hover.visible = false;
            this.addChild(this.layer_hover);

            this.shield = ValueBar.newStyled(this.game, "battle-shiplist-shield", 127, 48);
            this.addChild(this.shield);

            this.hull = ValueBar.newStyled(this.game, "battle-shiplist-hull", 60, 48);
            this.addChild(this.hull);

            this.active_effects = new Phaser.Group(this.game);
            this.active_effects.position.set(63, 9);
            this.addChild(this.active_effects);

            this.updateAttributes();
            this.updateEffects();
        }

        // Update attributes from associated ship
        updateAttributes() {
            this.attributeChanged(this.ship.hull);
            this.attributeChanged(this.ship.shield);
        }

        // Update effects applied on the ship
        updateEffects() {
            this.active_effects.removeAll(true);
            this.ship.temporary_effects.forEach((effect: Game.TemporaryEffect) => {
                var icon = new EffectDisplay(this.game, effect);
                this.active_effects.addChild(icon);
            });
        }

        // Called when an attribute for this ship changed through the battle log
        attributeChanged(attribute: Game.Attribute): void {
            if (attribute.code === Game.AttributeCode.Hull) {
                this.hull.setValue(attribute.current, attribute.maximal);
            } else if (attribute.code === Game.AttributeCode.Shield) {
                this.shield.setValue(attribute.current, attribute.maximal);
            }
        }

        // Move to a given location on screen
        moveTo(x: number, y: number, animate: boolean) {
            if (animate) {
                var tween = this.game.tweens.create(this);
                tween.to({x: x, y: y});
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

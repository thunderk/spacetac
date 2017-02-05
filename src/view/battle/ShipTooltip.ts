module TS.SpaceTac.View {
    // Tooltip to display ship information
    export class ShipTooltip extends Phaser.Sprite {
        battleview: BattleView;
        title: Phaser.Text;
        attr_hull: Phaser.Text;
        attr_shield: Phaser.Text;
        attr_power: Phaser.Text;
        attr_materials: Phaser.Text;
        attr_electronics: Phaser.Text;
        attr_energy: Phaser.Text;
        attr_human: Phaser.Text;
        attr_gravity: Phaser.Text;
        attr_time: Phaser.Text;
        active_effects: Phaser.Group;

        constructor(parent: BattleView) {
            super(parent.game, 0, 0, "battle-ship-tooltip-own");
            this.visible = false;
            this.battleview = parent;

            this.title = new Phaser.Text(this.game, 250, 10, "", { font: "24pt Arial", fill: "#ffffff" });
            this.title.anchor.set(0.5, 0);
            this.addChild(this.title);

            this.attr_hull = new Phaser.Text(this.game, 97, 86, "", { font: "18pt Arial", fill: "#eb4e4a", fontWeight: "bold" });
            this.attr_hull.anchor.set(0.5, 0.5);
            this.addChild(this.attr_hull);

            this.attr_shield = new Phaser.Text(this.game, 250, 86, "", { font: "18pt Arial", fill: "#2ad8dc", fontWeight: "bold" });
            this.attr_shield.anchor.set(0.5, 0.5);
            this.addChild(this.attr_shield);

            this.attr_power = new Phaser.Text(this.game, 397, 86, "", { font: "18pt Arial", fill: "#ffdd4b", fontWeight: "bold" });
            this.attr_power.anchor.set(0.5, 0.5);
            this.addChild(this.attr_power);

            this.attr_materials = new Phaser.Text(this.game, 217, 149, "", { font: "14pt Arial", fill: "#d5d5ff", fontWeight: "bold" });
            this.attr_materials.anchor.set(0.5, 0.5);
            this.addChild(this.attr_materials);

            this.attr_electronics = new Phaser.Text(this.game, 447, 149, "", { font: "14pt Arial", fill: "#d5d5ff", fontWeight: "bold" });
            this.attr_electronics.anchor.set(0.5, 0.5);
            this.addChild(this.attr_electronics);

            this.attr_energy = new Phaser.Text(this.game, 217, 176, "", { font: "14pt Arial", fill: "#d5d5ff", fontWeight: "bold" });
            this.attr_energy.anchor.set(0.5, 0.5);
            this.addChild(this.attr_energy);

            this.attr_human = new Phaser.Text(this.game, 447, 176, "", { font: "14pt Arial", fill: "#d5d5ff", fontWeight: "bold" });
            this.attr_human.anchor.set(0.5, 0.5);
            this.addChild(this.attr_human);

            this.attr_gravity = new Phaser.Text(this.game, 447, 203, "", { font: "14pt Arial", fill: "#d5d5ff", fontWeight: "bold" });
            this.attr_gravity.anchor.set(0.5, 0.5);
            this.addChild(this.attr_gravity);

            this.attr_time = new Phaser.Text(this.game, 217, 203, "", { font: "14pt Arial", fill: "#d5d5ff", fontWeight: "bold" });
            this.attr_time.anchor.set(0.5, 0.5);
            this.addChild(this.attr_time);

            this.active_effects = new Phaser.Group(this.game);
            this.addChild(this.active_effects);

            parent.ui.add(this);
        }

        // Set current ship to display, null to hide
        setShip(ship: Game.Ship | null): void {
            if (ship) {
                var enemy = ship.getPlayer() != this.battleview.player;
                this.loadTexture(`battle-ship-tooltip-${enemy ? "enemy" : "own"}`);

                // Find ship sprite to position next to it
                var sprite = this.battleview.arena.findShipSprite(ship);
                if (sprite) {
                    var x = sprite.worldPosition.x + sprite.width * sprite.worldScale.x * 0.5;
                    var y = sprite.worldPosition.y - sprite.height * sprite.worldScale.y * 0.5;
                    if (y + this.height > this.battleview.getHeight()) {
                        y = this.battleview.getHeight() - this.height;
                    }
                    if (y < 0) {
                        y = 0;
                    }
                    if (x + this.width > this.battleview.getWidth()) {
                        x = sprite.worldPosition.x - sprite.width * sprite.worldScale.x * 0.5 - this.width;
                    }
                    this.position.set(x, y);
                } else {
                    this.position.set(0, 0);
                }

                // Fill info
                this.title.setText(ship.name);
                this.attr_hull.setText(ship.hull.current.toString());
                this.attr_shield.setText(ship.shield.current.toString());
                this.attr_power.setText(ship.ap_current.current.toString());
                this.attr_materials.setText(ship.cap_material.current.toString());
                this.attr_electronics.setText(ship.cap_electronics.current.toString());
                this.attr_energy.setText(ship.cap_energy.current.toString());
                this.attr_human.setText(ship.cap_human.current.toString());
                this.attr_gravity.setText(ship.cap_gravity.current.toString());
                this.attr_time.setText(ship.cap_time.current.toString());
                this.active_effects.removeAll(true);
                ship.sticky_effects.forEach((effect, index) => {
                    this.addEffect(effect, index);
                });
                ship.listEquipment(Game.SlotType.Weapon).forEach((equipment, index) => {
                    this.addEquipment(equipment, ship.sticky_effects.length + index);
                });

                Animation.fadeIn(this.game, this, 200, 0.9);
            } else {
                Animation.fadeOut(this.game, this, 200);
            }
        }

        /**
         * Add a sticky effect display
         */
        addEffect(effect: Game.StickyEffect, index = 0) {
            let effect_group = new Phaser.Image(this.game, 27, 243 + 60 * index, "battle-ship-tooltip-effect");
            this.active_effects.addChild(effect_group);

            if (effect.base instanceof Game.AttributeLimitEffect) {
                let attr_name = Game.AttributeCode[effect.base.attrcode].toLowerCase().replace('_', '');
                let attr_icon = new Phaser.Image(this.game, 30, effect_group.height / 2, `battle-attributes-${attr_name}`);
                attr_icon.anchor.set(0.5, 0.5);
                attr_icon.scale.set(0.17, 0.17);
                effect_group.addChild(attr_icon);

                let effect_icon = new Phaser.Image(this.game, 30, effect_group.height / 2, "battle-attributes-effect-limit");
                effect_icon.anchor.set(0.5, 0.5);
                effect_icon.scale.set(0.17, 0.17);
                effect_group.addChild(effect_icon);
            }

            let text = `${effect.getDescription()} (${effect.duration} turns)`;
            let color = effect.isBeneficial() ? "afe9c6" : "#e9afaf";
            let effect_text = new Phaser.Text(this.game, 60, effect_group.height / 2, text, { font: "16pt Arial", fill: color });
            effect_text.anchor.set(0, 0.5);
            effect_group.addChild(effect_text);
        }

        /**
         * Add an equipment action display
         */
        addEquipment(equipment: Game.Equipment, index = 0) {
            let effect_group = new Phaser.Image(this.game, 27, 243 + 60 * index, "battle-ship-tooltip-effect");
            this.active_effects.addChild(effect_group);

            let effect_icon = new Phaser.Image(this.game, 30, effect_group.height / 2, `battle-actions-${equipment.action.code}`);
            effect_icon.anchor.set(0.5, 0.5);
            effect_icon.scale.set(0.17, 0.17);
            effect_group.addChild(effect_icon);

            let effect_text = new Phaser.Text(this.game, 60, effect_group.height / 2, equipment.name, { font: "16pt Arial", fill: "#ffffff" });
            effect_text.anchor.set(0, 0.5);
            effect_group.addChild(effect_text);
        }
    }
}

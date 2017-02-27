module TS.SpaceTac.UI {
    /**
     * Character sheet, displaying ship characteristics
     */
    export class CharacterSheet extends Phaser.Image {
        // Currently displayed fleet
        fleet: Fleet;

        // Currently displayed ship
        ship: Ship;

        // Ship name
        ship_name: Phaser.Text;

        // Ship level
        ship_level: Phaser.Text;

        // Ship upgrade points
        ship_upgrades: Phaser.Text;

        // Fleet's portraits
        portraits: Phaser.Group;

        // Credits
        credits: Phaser.Text;

        // Attributes and skills
        attributes: { [key: string]: Phaser.Text } = {};

        constructor(view: BaseView) {
            super(view.game, 0, 0, "character-sheet");

            this.x = -this.width;
            this.inputEnabled = true;

            let close_button = new Phaser.Button(this.game, view.getWidth(), 0, "character-close", () => this.hide());
            close_button.anchor.set(1, 0);
            this.addChild(close_button);

            this.ship_name = new Phaser.Text(this.game, 758, 48, "", { align: "center", font: "30pt Arial", fill: "#FFFFFF" });
            this.ship_name.anchor.set(0.5, 0.5);
            this.addChild(this.ship_name);

            this.ship_level = new Phaser.Text(this.game, 552, 1054, "", { align: "center", font: "30pt Arial", fill: "#FFFFFF" });
            this.ship_level.anchor.set(0.5, 0.5);
            this.addChild(this.ship_level);

            this.ship_upgrades = new Phaser.Text(this.game, 1066, 1054, "", { align: "center", font: "30pt Arial", fill: "#FFFFFF" });
            this.ship_upgrades.anchor.set(0.5, 0.5);
            this.addChild(this.ship_upgrades);

            this.portraits = new Phaser.Group(this.game);
            this.portraits.position.set(152, 0);
            this.addChild(this.portraits);

            this.credits = new Phaser.Text(this.game, 136, 38, "", { align: "center", font: "30pt Arial", fill: "#FFFFFF" });
            this.credits.anchor.set(0.5, 0.5);
            this.addChild(this.credits);

            let x1 = 664;
            let x2 = 1066;
            let y = 662;
            this.addAttribute(SHIP_ATTRIBUTES.initiative, x1, y);
            this.addAttribute(SHIP_ATTRIBUTES.hull_capacity, x1, y + 64);
            this.addAttribute(SHIP_ATTRIBUTES.shield_capacity, x1, y + 128);
            this.addAttribute(SHIP_ATTRIBUTES.power_capacity, x1, y + 192);
            this.addAttribute(SHIP_ATTRIBUTES.power_initial, x1, y + 256);
            this.addAttribute(SHIP_ATTRIBUTES.power_recovery, x1, y + 320);
            this.addAttribute(SHIP_ATTRIBUTES.skill_material, x2, y);
            this.addAttribute(SHIP_ATTRIBUTES.skill_electronics, x2, y + 64);
            this.addAttribute(SHIP_ATTRIBUTES.skill_energy, x2, y + 128);
            this.addAttribute(SHIP_ATTRIBUTES.skill_human, x2, y + 192);
            this.addAttribute(SHIP_ATTRIBUTES.skill_gravity, x2, y + 256);
            this.addAttribute(SHIP_ATTRIBUTES.skill_time, x2, y + 320);
        }

        /**
         * Add an attribute display
         */
        private addAttribute(attribute: ShipAttribute, x: number, y: number) {
            let text = new Phaser.Text(this.game, x, y, "", { align: "center", font: "18pt Arial", fill: "#FFFFFF" });
            text.anchor.set(0.5, 0.5);
            this.addChild(text);

            this.attributes[attribute.name] = text;
        }

        /**
         * Update the fleet sidebar
         */
        updateFleet(fleet: Fleet) {
            if (fleet != this.fleet) {
                this.portraits.removeAll(true);
                this.fleet = fleet;
            }

            fleet.ships.forEach((ship, idx) => {
                let portrait = this.portraits.children.length > idx ? this.portraits.getChildAt(idx) : null;
                let key = ship == this.ship ? "character-ship-selected" : "character-ship";
                if (portrait instanceof Phaser.Button) {
                    portrait.loadTexture(key);
                } else {
                    let new_portrait = new Phaser.Button(this.game, 0, idx * 320, key, () => this.show(ship));
                    new_portrait.anchor.set(0.5, 0.5);
                    this.portraits.addChild(new_portrait);

                    let portrait_pic = new Phaser.Image(this.game, 0, 0, `ship-${ship.model}-portrait`);
                    portrait_pic.anchor.set(0.5, 0.5);
                    new_portrait.addChild(portrait_pic);
                }
            });

            this.credits.setText(fleet.credits.toString());

            this.portraits.scale.set(980 * this.portraits.scale.x / this.portraits.height, 980 * this.portraits.scale.y / this.portraits.height);
            this.portraits.y = 80 + 160 * this.portraits.scale.x;
        }

        /**
         * Show the sheet for a given ship
         */
        show(ship: Ship, animate = true) {
            this.ship = ship;

            this.ship_name.setText(ship.name);
            this.ship_level.setText(ship.level.toString());
            this.ship_upgrades.setText(ship.upgrade_points.toString());

            iteritems(<any>ship.attributes, (key, value: ShipAttribute) => {
                let text = this.attributes[value.name];
                if (text) {
                    text.setText(value.get().toString());
                }
            });

            this.updateFleet(ship.fleet);

            if (animate) {
                this.game.tweens.create(this).to({ x: 0 }, 800, Phaser.Easing.Circular.InOut, true);
            } else {
                this.x = 0;
            }
        }

        /**
         * Hide the sheet
         */
        hide() {
            this.game.tweens.create(this).to({ x: -this.width }, 800, Phaser.Easing.Circular.InOut, true);
        }
    }
}

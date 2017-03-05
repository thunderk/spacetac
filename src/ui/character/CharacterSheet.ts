module TS.SpaceTac.UI {
    /**
     * Character sheet, displaying ship characteristics
     */
    export class CharacterSheet extends Phaser.Image {
        // X positions
        xshown: number;
        xhidden: number;

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

        // Ship slots
        ship_slots: Phaser.Group;

        // Ship cargo
        ship_cargo: Phaser.Group;

        // Fleet's portraits
        portraits: Phaser.Group;

        // Credits
        credits: Phaser.Text;

        // Attributes and skills
        attributes: { [key: string]: Phaser.Text } = {};

        constructor(view: BaseView, xhidden = -2000, xshown = 0) {
            super(view.game, 0, 0, "character-sheet");

            this.x = xhidden;
            this.xshown = xshown;
            this.xhidden = xhidden;
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

            this.ship_slots = new Phaser.Group(this.game);
            this.ship_slots.position.set(372, 120);
            this.addChild(this.ship_slots);

            this.ship_cargo = new Phaser.Group(this.game);
            this.ship_cargo.position.set(1240, 86);
            this.addChild(this.ship_cargo);

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

            let slotsinfo = CharacterSheet.getSlotPositions(ship.slots.length, 800, 454, 200, 200);
            this.ship_slots.removeAll(true);
            ship.slots.forEach((slot, idx) => {
                let slot_display = new CharacterSlot(this, slotsinfo.positions[idx].x, slotsinfo.positions[idx].y, slot.type);
                slot_display.scale.set(slotsinfo.scaling, slotsinfo.scaling);
                this.ship_slots.addChild(slot_display);

                if (slot.attached) {
                    let equipment = new CharacterEquipment(this, slot.attached);
                    slot_display.setEquipment(equipment);
                }
            });

            slotsinfo = CharacterSheet.getSlotPositions(ship.cargo_space, 638, 496, 200, 200);
            this.ship_cargo.removeAll(true);
            range(ship.cargo_space).forEach(idx => {
                let cargo_slot = new CharacterCargo(this, slotsinfo.positions[idx].x, slotsinfo.positions[idx].y);
                cargo_slot.scale.set(slotsinfo.scaling, slotsinfo.scaling);
                this.ship_cargo.addChild(cargo_slot);
            });

            this.updateFleet(ship.fleet);

            if (animate) {
                this.game.tweens.create(this).to({ x: this.xshown }, 800, Phaser.Easing.Circular.InOut, true);
            } else {
                this.x = this.xshown;
            }
        }

        /**
         * Hide the sheet
         */
        hide(animate = true) {
            this.portraits.children.forEach((portrait: Phaser.Button) => portrait.loadTexture("character-ship"));

            if (animate) {
                this.game.tweens.create(this).to({ x: this.xhidden }, 800, Phaser.Easing.Circular.InOut, true);
            } else {
                this.x = this.xhidden;
            }
        }

        /**
         * Get the positions and scaling for slots, to fit in a rectangle group.
         */
        static getSlotPositions(count: number, areawidth: number, areaheight: number, slotwidth: number, slotheight: number): { positions: { x: number, y: number }[], scaling: number } {
            // Find grid size
            let rows = 2;
            let columns = 3;
            while (count > rows * columns) {
                rows += 1;
                columns += 1;
            }

            // Find scaling
            let scaling = 1;
            while (slotwidth * scaling > areawidth || slotheight * scaling > areaheight) {
                scaling *= 0.99;
            }

            // Position
            let positions = range(count).map(i => {
                let row = Math.floor(i / columns);
                let column = i % columns;
                return { x: column * (areawidth - slotwidth * scaling) / (columns - 1), y: row * (areaheight - slotheight * scaling) / (rows - 1) };
            });
            return { positions: positions, scaling: scaling };
        }
    }
}

module TS.SpaceTac.UI {
    export type CharacterEquipmentDrop = {
        message: string
        callback: (equipment: Equipment) => any
    }

    /**
     * Character sheet, displaying ship characteristics
     */
    export class CharacterSheet extends Phaser.Image {
        // Parent view
        view: BaseView;

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

        // Ship skill upgrade
        ship_upgrade_points: Phaser.Text;
        ship_upgrades: Phaser.Group;

        // Ship slots
        ship_slots: Phaser.Group;

        // Ship cargo
        ship_cargo: Phaser.Group;

        // Mode title
        mode_title: Phaser.Text;

        // Loot items
        loot_slots: Phaser.Group;
        loot_items: Equipment[] = [];
        loot_page = 0;
        loot_next: Phaser.Button;
        loot_prev: Phaser.Button;

        // Shop
        shop: Shop | null = null;

        // Fleet's portraits
        portraits: Phaser.Group;

        // Layer for draggable equipments
        equipments: Phaser.Group;

        // Credits
        credits: Phaser.Text;

        // Attributes and skills
        attributes: { [key: string]: Phaser.Text } = {};

        constructor(view: BaseView, xhidden = -2000, xshown = 0) {
            super(view.game, 0, 0, "character-sheet");

            this.view = view;

            this.x = xhidden;
            this.xshown = xshown;
            this.xhidden = xhidden;
            this.inputEnabled = true;

            let close_button = new Phaser.Button(this.game, view.getWidth(), 0, "character-close", () => this.hide());
            close_button.anchor.set(1, 0);
            this.addChild(close_button);
            view.tooltip.bindStaticText(close_button, "Close the character sheet");

            this.ship_name = new Phaser.Text(this.game, 758, 48, "", { align: "center", font: "30pt Arial", fill: "#FFFFFF" });
            this.ship_name.anchor.set(0.5, 0.5);
            this.addChild(this.ship_name);

            this.ship_level = new Phaser.Text(this.game, 552, 1054, "", { align: "center", font: "30pt Arial", fill: "#FFFFFF" });
            this.ship_level.anchor.set(0.5, 0.5);
            this.addChild(this.ship_level);

            this.ship_upgrade_points = new Phaser.Text(this.game, 1066, 1054, "", { align: "center", font: "30pt Arial", fill: "#FFFFFF" });
            this.ship_upgrade_points.anchor.set(0.5, 0.5);
            this.addChild(this.ship_upgrade_points);

            this.ship_upgrades = new Phaser.Group(this.game);
            this.addChild(this.ship_upgrades);

            this.ship_slots = new Phaser.Group(this.game);
            this.ship_slots.position.set(372, 120);
            this.addChild(this.ship_slots);

            this.ship_cargo = new Phaser.Group(this.game);
            this.ship_cargo.position.set(1240, 86);
            this.addChild(this.ship_cargo);

            this.loot_slots = new Phaser.Group(this.game);
            this.loot_slots.position.set(1270, 670);
            this.loot_slots.visible = false;
            this.addChild(this.loot_slots);

            this.portraits = new Phaser.Group(this.game);
            this.portraits.position.set(152, 0);
            this.addChild(this.portraits);

            this.credits = new Phaser.Text(this.game, 136, 38, "", { align: "center", font: "30pt Arial", fill: "#FFFFFF" });
            this.credits.anchor.set(0.5, 0.5);
            this.addChild(this.credits);

            this.equipments = new Phaser.Group(this.game);
            this.addChild(this.equipments);

            this.mode_title = new Phaser.Text(this.game, 1548, 648, "", { align: "center", font: "18pt Arial", fill: "#FFFFFF" });
            this.mode_title.anchor.set(0.5, 0.5);
            this.addChild(this.mode_title);

            this.loot_next = new Phaser.Button(this.game, 1890, 850, "character-scroll", () => this.paginate(1));
            this.loot_next.anchor.set(0.5, 0.5);
            this.addChild(this.loot_next);

            this.loot_prev = new Phaser.Button(this.game, 1238, 850, "character-scroll", () => this.paginate(-1));
            this.loot_prev.anchor.set(0.5, 0.5);
            this.loot_prev.angle = 180;
            this.addChild(this.loot_prev);

            let x1 = 664;
            let x2 = 1066;
            let y = 662;
            this.addAttribute("initiative", x1, y);
            this.addAttribute("hull_capacity", x1, y + 64);
            this.addAttribute("shield_capacity", x1, y + 128);
            this.addAttribute("power_capacity", x1, y + 192);
            this.addAttribute("power_initial", x1, y + 256);
            this.addAttribute("power_recovery", x1, y + 320);
            this.addAttribute("skill_material", x2, y);
            this.addAttribute("skill_electronics", x2, y + 64);
            this.addAttribute("skill_energy", x2, y + 128);
            this.addAttribute("skill_human", x2, y + 192);
            this.addAttribute("skill_gravity", x2, y + 256);
            this.addAttribute("skill_time", x2, y + 320);
        }

        /**
         * Add an attribute display
         */
        private addAttribute(attribute: keyof ShipAttributes, x: number, y: number) {
            let text = new Phaser.Text(this.game, x, y, "", { align: "center", font: "18pt Arial", fill: "#FFFFFF" });
            text.anchor.set(0.5, 0.5);
            this.addChild(text);

            this.attributes[SHIP_ATTRIBUTES[attribute].name] = text;

            if (SHIP_SKILLS.hasOwnProperty(attribute)) {
                let button = new Phaser.Button(this.game, x + 54, y - 4, "character-skill-upgrade", () => {
                    this.ship.upgradeSkill(<keyof ShipSkills>attribute);
                    this.refresh();
                });
                button.anchor.set(0.5, 0.5);
                this.ship_upgrades.add(button);

                this.view.tooltip.bindStaticText(button, `Spend one point to upgrade ${SHIP_ATTRIBUTES[attribute].name}`);
            }
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
                let portrait = this.portraits.children.length > idx ? <CharacterFleetMember>this.portraits.getChildAt(idx) : null;
                if (!portrait) {
                    portrait = new CharacterFleetMember(this, 0, idx * 320, ship);
                    this.portraits.add(portrait);
                }
                portrait.setSelected(ship == this.ship);
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

            this.equipments.removeAll(true);

            let upgrade_points = ship.getAvailableUpgradePoints();

            this.ship_name.setText(ship.name);
            this.ship_level.setText(ship.level.get().toString());
            this.ship_upgrade_points.setText(upgrade_points.toString());
            this.ship_upgrades.visible = upgrade_points > 0;

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
                    let equipment = new CharacterEquipment(this, slot.attached, slot_display);
                    this.equipments.addChild(equipment);
                }
            });

            slotsinfo = CharacterSheet.getSlotPositions(ship.cargo_space, 638, 496, 200, 200);
            this.ship_cargo.removeAll(true);
            range(ship.cargo_space).forEach(idx => {
                let cargo_slot = new CharacterCargo(this, slotsinfo.positions[idx].x, slotsinfo.positions[idx].y);
                cargo_slot.scale.set(slotsinfo.scaling, slotsinfo.scaling);
                this.ship_cargo.addChild(cargo_slot);

                if (idx < this.ship.cargo.length) {
                    let equipment = new CharacterEquipment(this, this.ship.cargo[idx], cargo_slot);
                    this.equipments.addChild(equipment);
                }
            });

            this.updateLoot();

            this.updateFleet(ship.fleet);

            if (this.shop) {
                this.updatePrices(this.shop);
            }

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
            this.loot_items = [];
            this.shop = null;
            this.loot_slots.visible = false;
            this.mode_title.visible = false;

            this.portraits.children.forEach((portrait: Phaser.Button) => portrait.loadTexture("character-ship"));

            if (animate) {
                this.game.tweens.create(this).to({ x: this.xhidden }, 800, Phaser.Easing.Circular.InOut, true);
            } else {
                this.x = this.xhidden;
            }
        }

        /**
         * Set the list of lootable equipment
         * 
         * The list of equipments may be altered if items are taken from it
         * 
         * This list will be shown until sheet is closed
         */
        setLoot(loot: Equipment[]) {
            this.loot_page = 0;

            this.loot_items = loot;
            this.updateLoot();
            this.loot_slots.visible = true;

            this.mode_title.setText("Lootable items");
            this.mode_title.visible = true;
        }

        /**
         * Set the displayed shop
         * 
         * This shop will be shown until sheet is closed
         */
        setShop(shop: Shop) {
            this.loot_page = 0;

            this.shop = shop;
            this.updateLoot();
            this.loot_slots.visible = true;

            this.mode_title.setText("Shop's equipment");
            this.mode_title.visible = true;
        }

        /**
         * Update the price tags on each equipment, for a specific shop
         */
        updatePrices(shop: Shop) {
            this.equipments.children.forEach((equipement: CharacterEquipment) => {
                equipement.setPrice(shop.getPrice(equipement.item));
            });
        }

        /**
         * Change the page displayed in loot/shop section
         */
        paginate(offset: number) {
            let items = this.shop ? this.shop.stock : this.loot_items;
            this.loot_page = clamp(this.loot_page + offset, 0, 1 + Math.floor(items.length / 12));
            this.refresh();
        }

        /**
         * Update the loot slots
         */
        private updateLoot() {
            let per_page = 12;
            this.loot_slots.removeAll(true);

            let info = CharacterSheet.getSlotPositions(12, 588, 354, 196, 196);
            let items = this.shop ? this.shop.stock : this.loot_items;
            range(per_page).forEach(idx => {
                let loot_slot = this.shop ? new CharacterShopSlot(this, info.positions[idx].x, info.positions[idx].y) : new CharacterLootSlot(this, info.positions[idx].x, info.positions[idx].y);
                loot_slot.scale.set(info.scaling, info.scaling);
                this.loot_slots.addChild(loot_slot);

                idx += per_page * this.loot_page;

                if (idx < items.length) {
                    let equipment = new CharacterEquipment(this, items[idx], loot_slot);
                    this.equipments.addChild(equipment);
                }
            });

            this.view.animations.setVisible(this.loot_prev, this.loot_page > 0, 200);
            this.view.animations.setVisible(this.loot_next, (this.loot_page + 1) * per_page < items.length, 200);
        }

        /**
         * Get an iterator over equipment containers
         */
        iEquipmentContainers(): Iterator<CharacterEquipmentContainer> {
            let candidates = ichain<CharacterEquipmentContainer>(
                iarray(<CharacterFleetMember[]>this.portraits.children),
                iarray(<CharacterSlot[]>this.ship_slots.children),
                iarray(<CharacterCargo[]>this.ship_cargo.children),
            );

            if (this.loot_slots.visible) {
                candidates = ichain(candidates, iarray(<CharacterLootSlot[]>this.loot_slots.children));
            }

            return candidates;
        }

        /**
         * Refresh the sheet display
         */
        refresh() {
            this.show(this.ship);
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
            while (slotwidth * scaling * columns > areawidth || slotheight * scaling * rows > areaheight) {
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

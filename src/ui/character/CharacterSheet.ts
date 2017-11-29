module TK.SpaceTac.UI {
    export type CharacterEquipmentDrop = {
        message: string
        callback: (equipment: Equipment) => any
    }

    /**
     * Character sheet, displaying ship characteristics
     */
    export class CharacterSheet extends Phaser.Image {
        // Globally interactive sheet (equipment can be moved, points upgraded)
        interactive = true

        // Parent view
        view: BaseView

        // UI components builder
        builder: UIBuilder

        // X positions
        xshown: number
        xhidden: number

        // Close button
        close_button: Phaser.Button

        // Currently displayed fleet
        fleet: Fleet

        // Currently displayed ship
        ship: Ship

        // Ship name
        ship_name: Phaser.Text

        // Ship level
        ship_level: Phaser.Text
        ship_experience: ValueBar

        // Ship skill upgrade
        ship_upgrade_points: Phaser.Text
        layer_upgrades: Phaser.Group

        // Ship slots
        ship_slots: Phaser.Group

        // Ship cargo
        ship_cargo: Phaser.Group

        // Dynamic texts
        mode_title: UIText
        action_message: UIText

        // Loot items
        loot_slots: Phaser.Group
        loot_items: Equipment[] = []
        loot_page = 0
        loot_next: Phaser.Button
        loot_prev: Phaser.Button

        // Shop
        shop: Shop | null = null

        // Fleet portraits
        members: CharacterFleetMember[] = []
        portraits: Phaser.Group

        // Layers
        layer_attibutes: Phaser.Group
        layer_equipments: Phaser.Group

        // Credits
        credits: Phaser.Text

        // Attributes and skills
        attributes: { [key: string]: Phaser.Text } = {}

        constructor(view: BaseView, xhidden = -2000, xshown = 0, onclose?: Function) {
            super(view.game, 0, 0, "character-sheet");

            this.view = view;
            this.builder = new UIBuilder(view, this);

            this.x = xhidden;
            this.xshown = xshown;
            this.xhidden = xhidden;
            this.inputEnabled = true;

            if (!onclose) {
                onclose = () => this.hide();
            }
            this.close_button = this.builder.button("character-close", 1920, 0, onclose, "Close the character sheet");
            this.close_button.anchor.set(1, 0);

            this.builder.text("Cargo", 1566, 36, { size: 24 });
            this.builder.text("Level", 420, 1052, { size: 24 });
            this.builder.text("Available points", 894, 1052, { size: 24 });

            this.ship_name = this.builder.text("", 758, 48, { size: 30 });
            this.ship_level = this.builder.text("", 554, 1052, { size: 30 });
            this.ship_upgrade_points = this.builder.text("", 1068, 1052, { size: 30 });
            this.ship_slots = this.builder.group("slots", 372, 120);
            this.ship_cargo = this.builder.group("cargo", 1240, 86);
            this.loot_slots = this.builder.group("loot", 1270, 670);
            this.loot_slots.visible = false;
            this.portraits = this.builder.group("portraits", 152, 0);
            this.credits = this.builder.text("", 136, 38, { size: 30 });
            this.mode_title = this.builder.text("", 1566, 648, { size: 18 });
            this.action_message = this.builder.text("", 1566, 1056, { size: 18 });
            this.loot_next = this.builder.button("common-arrow-right", 1890, 850, () => this.paginate(1), "Show next items");
            this.loot_next.anchor.set(0.5);
            this.loot_prev = this.builder.button("common-arrow-left", 1238, 850, () => this.paginate(-1), "Show previous items");
            this.loot_prev.anchor.set(0.5);

            this.ship_experience = new ValueBar(this.view, "character-experience", ValueBarOrientation.EAST, 516, 1067);
            this.addChild(this.ship_experience.node);

            this.layer_attibutes = this.builder.group("attributes");
            this.layer_upgrades = this.builder.group("upgrades");
            this.layer_equipments = this.builder.group("equipments");

            let x1 = 402;
            let x2 = 802;
            let y = 640;
            this.addAttribute("hull_capacity", x1, y);
            this.addAttribute("shield_capacity", x1, y + 64);
            this.addAttribute("power_capacity", x1, y + 128);
            this.addAttribute("power_generation", x1, y + 192);
            this.addAttribute("maneuvrability", x1, y + 256);
            this.addAttribute("precision", x1, y + 320);
            this.addAttribute("skill_materials", x2, y);
            this.addAttribute("skill_photons", x2, y + 64);
            this.addAttribute("skill_antimatter", x2, y + 128);
            this.addAttribute("skill_quantum", x2, y + 192);
            this.addAttribute("skill_gravity", x2, y + 256);
            this.addAttribute("skill_time", x2, y + 320);
        }

        /**
         * Check if the sheet should be interactive
         */
        isInteractive(): boolean {
            return bool(this.ship) && !this.ship.critical && this.interactive;
        }

        /**
         * Add an attribute display
         */
        private addAttribute(attribute: keyof ShipAttributes, x: number, y: number) {
            let builder = this.builder.in(this.layer_attibutes);

            let button = builder.button("character-attribute", x, y, undefined, () => this.ship.getAttributeDescription(attribute));

            let attrname = capitalize(SHIP_VALUES_NAMES[attribute]);
            builder.in(button).text(attrname, 120, 22, { size: 20, color: "#c9d8ef", stroke_width: 1, stroke_color: "#395665" });

            let value = builder.in(button).text("", 264, 24, { size: 18, bold: true });

            this.attributes[attribute] = value;

            if (SHIP_SKILLS.hasOwnProperty(attribute)) {
                this.builder.in(this.layer_upgrades).button("character-skill-upgrade", x + 292, y, () => {
                    this.ship.upgradeSkill(<keyof ShipSkills>attribute);
                    this.refresh();
                }, `Spend one point to upgrade ${attrname}`);
            }
        }

        /**
         * Update the fleet sidebar
         */
        updateFleet(fleet: Fleet) {
            if (fleet != this.fleet || fleet.ships.length != this.members.length) {
                this.portraits.removeAll(true);
                this.members = [];
                this.fleet = fleet;
            }

            fleet.ships.forEach((ship, idx) => {
                let portrait = this.members[idx];
                if (!portrait) {
                    portrait = new CharacterFleetMember(this, 0, idx * 320, ship);
                    this.portraits.add(portrait);
                    this.members.push(portrait);
                }
                portrait.setSelected(ship == this.ship);
            });

            this.credits.setText(fleet.credits.toString());

            this.portraits.scale.set(980 * this.portraits.scale.x / this.portraits.height, 980 * this.portraits.scale.y / this.portraits.height);
            if (this.portraits.width > 308) {
                this.portraits.scale.set(308 * this.portraits.scale.x / this.portraits.width, 308 * this.portraits.scale.y / this.portraits.width);
            }
            this.portraits.y = 80 + 160 * this.portraits.scale.x;
        }

        /**
         * Show the sheet for a given ship
         */
        show(ship: Ship, animate = true, sound = true, interactive?: boolean) {
            this.ship = ship;
            if (typeof interactive != "undefined") {
                this.interactive = interactive;
            }

            this.layer_equipments.removeAll(true);
            this.setActionMessage();

            let upgrade_points = ship.getAvailableUpgradePoints();

            this.ship_name.setText(ship.getFullName());
            this.ship_level.setText(ship.level.get().toString());
            this.ship_experience.setValue(ship.level.getExperience(), ship.level.getNextGoal());
            this.ship_upgrade_points.setText(upgrade_points.toString());
            this.layer_upgrades.visible = this.isInteractive() && upgrade_points > 0;

            iteritems(<any>ship.attributes, (key, value: ShipAttribute) => {
                let text = this.attributes[key];
                if (text) {
                    text.setText(value.get().toString());
                }
            });

            let slotsinfo = CharacterSheet.getSlotPositions(ship.slots.length, 800, 454, 200, 200);
            this.ship_slots.removeAll(true);
            ship.slots.forEach((slot, idx) => {
                let slot_display = new CharacterSlot(this, slotsinfo.positions[idx].x, slotsinfo.positions[idx].y, slot.type);
                slot_display.scale.set(slotsinfo.scaling, slotsinfo.scaling);
                slot_display.alpha = this.isInteractive() ? 1 : 0.5;
                this.ship_slots.add(slot_display);

                if (slot.attached) {
                    let equipment = new CharacterEquipment(this, slot.attached, slot_display);
                    this.layer_equipments.add(equipment);
                }
            });

            slotsinfo = CharacterSheet.getSlotPositions(ship.cargo_space, 638, 496, 200, 200);
            this.ship_cargo.removeAll(true);
            range(ship.cargo_space).forEach(idx => {
                let cargo_slot = new CharacterCargo(this, slotsinfo.positions[idx].x, slotsinfo.positions[idx].y);
                cargo_slot.scale.set(slotsinfo.scaling, slotsinfo.scaling);
                cargo_slot.alpha = this.isInteractive() ? 1 : 0.5;
                this.ship_cargo.add(cargo_slot);

                if (idx < this.ship.cargo.length) {
                    let equipment = new CharacterEquipment(this, this.ship.cargo[idx], cargo_slot);
                    this.layer_equipments.add(equipment);
                }
            });

            this.updateLoot();

            this.updateFleet(ship.fleet);

            if (this.shop) {
                this.updatePrices(this.shop);
            }

            if (sound) {
                this.view.audio.playOnce("ui-dialog-open");
            }

            if (animate) {
                this.game.tweens.create(this).to({ x: this.xshown }, 400, Phaser.Easing.Circular.InOut, true);
            } else {
                this.x = this.xshown;
            }
        }

        /**
         * Hide the sheet
         */
        hide(animate = true) {
            this.loot_page = 0;
            this.loot_items = [];
            this.shop = null;
            this.loot_slots.visible = false;
            this.mode_title.visible = false;

            this.members.forEach(member => member.setSelected(false));

            this.view.audio.playOnce("ui-dialog-close");

            if (animate) {
                this.game.tweens.create(this).to({ x: this.xhidden }, 400, Phaser.Easing.Circular.InOut, true);
            } else {
                this.x = this.xhidden;
            }
        }

        /**
         * Set the action message (mainly used while dragging equipment to explain what is happening)
         */
        setActionMessage(message = "", color = "#ffffff"): void {
            if (message != this.action_message.text) {
                this.action_message.setText(message);
                this.action_message.fill = color;
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
        setShop(shop: Shop, title = "Dockyard's equipment") {
            this.loot_page = 0;

            this.shop = shop;
            this.updateLoot();
            this.loot_slots.visible = true;

            this.mode_title.setText(title);
            this.mode_title.visible = true;
        }

        /**
         * Update the price tags on each equipment, for a specific shop
         */
        updatePrices(shop: Shop) {
            this.layer_equipments.children.forEach(equipement => {
                if (equipement instanceof CharacterEquipment) {
                    equipement.setPrice(shop.getPrice(equipement.item));
                }
            });
        }

        /**
         * Change the page displayed in loot/shop section
         */
        paginate(offset: number) {
            let items = this.shop ? this.shop.getStock() : this.loot_items;
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
            let items = this.shop ? this.shop.getStock() : this.loot_items;
            range(per_page).forEach(idx => {
                let loot_slot = this.shop ? new CharacterShopSlot(this, info.positions[idx].x, info.positions[idx].y) : new CharacterLootSlot(this, info.positions[idx].x, info.positions[idx].y);
                loot_slot.scale.set(info.scaling, info.scaling);
                this.loot_slots.add(loot_slot);

                idx += per_page * this.loot_page;

                if (idx < items.length) {
                    let equipment = new CharacterEquipment(this, items[idx], loot_slot);
                    this.layer_equipments.add(equipment);
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
            this.show(this.ship, false, false);
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

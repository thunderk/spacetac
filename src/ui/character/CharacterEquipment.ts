module TS.SpaceTac.UI {
    /**
     * Interface for any graphical area that may contain or receive an equipment
     */
    export interface CharacterEquipmentContainer {
        /**
         * Check if a point in the character sheet is inside the container
         */
        isInside(x: number, y: number): boolean
        /**
         * Get a centric anchor point and scaling to snap the equipment
         */
        getEquipmentAnchor(): { x: number, y: number, scale: number }
        /**
         * Get a vertical offset to position the price tag
         */
        getPriceOffset(): number
        /**
         * Add an equipment to the container
         */
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): boolean
        /**
         * Remove an equipment from the container
         */
        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): boolean
    }

    /**
     * Display a ship equipment, either attached to a slot, in cargo, or being dragged down
     */
    export class CharacterEquipment extends Phaser.Button {
        sheet: CharacterSheet
        item: Equipment
        container: CharacterEquipmentContainer
        price: number

        constructor(sheet: CharacterSheet, equipment: Equipment, container: CharacterEquipmentContainer) {
            let icon = sheet.view.getImage(`equipment-${equipment.code}`, `battle-actions-${equipment.action.code}`);
            super(sheet.game, 0, 0, icon);

            this.sheet = sheet;
            this.item = equipment;
            this.container = container;
            this.price = 0;

            this.anchor.set(0.5, 0.5);

            this.setupDragDrop(sheet);
            this.snapToContainer();

            sheet.view.tooltip.bind(this, filler => this.fillTooltip(filler));
        }

        jasmineToString() {
            return this.item.jasmineToString();
        }

        /**
         * Find the container under a specific screen location
         */
        findContainerAt(x: number, y: number): CharacterEquipmentContainer | null {
            return ifirst(this.sheet.iEquipmentContainers(), container => container.isInside(x, y));
        }

        /**
         * Display a price tag
         */
        setPrice(price: number) {
            if (!price || this.price) {
                return;
            }
            this.price = price;

            let tag = new Phaser.Image(this.game, 0, 0, "character-price-tag");
            let yoffset = this.container.getPriceOffset();
            tag.position.set(0, -yoffset * 2 + tag.height);
            tag.anchor.set(0.5, 0.5);
            tag.scale.set(2, 2);
            tag.alpha = 0.85;
            this.addChild(tag);

            let text = new Phaser.Text(this.game, -10, 4, price.toString(), { align: "center", font: "18pt Arial", fill: "#FFFFCC" });
            text.anchor.set(0.5, 0.5);
            tag.addChild(text);
        }

        /**
         * Snap in place to its current container
         */
        snapToContainer() {
            let info = this.container.getEquipmentAnchor();
            this.position.set(info.x, info.y);
            this.scale.set(0.5 * info.scale, 0.5 * info.scale);
            this.alpha = 1.0;
        }

        /**
         * Enable dragging to another slot
         */
        setupDragDrop(sheet: CharacterSheet) {
            this.inputEnabled = true;
            this.input.enableDrag(false, true);

            this.events.onDragStart.add(() => {
                this.scale.set(0.5, 0.5);
                this.alpha = 0.8;
            });
            this.events.onDragStop.add(() => {
                let destination = this.findContainerAt(this.x, this.y);
                if (destination && destination != this.container) {
                    if (this.applyDragDrop(this.container, destination, false)) {
                        this.container = destination;
                        this.snapToContainer();
                        sheet.refresh();  // TODO Only if required (destination is "virtual")
                    } else {
                        this.snapToContainer();
                    }
                } else {
                    this.snapToContainer();
                }
            });
        }

        /**
         * Apply drag and drop between two containers
         * 
         * Return true if something changed (or would change, if test=true).
         */
        applyDragDrop(source: CharacterEquipmentContainer, destination: CharacterEquipmentContainer, test: boolean): boolean {
            let possible = source.removeEquipment(this, destination, true) && destination.addEquipment(this, source, true);
            if (test) {
                return possible;
            } else if (possible) {
                if (source.removeEquipment(this, destination, false)) {
                    if (destination.addEquipment(this, source, false)) {
                        return true;
                    } else {
                        console.error("Destination container refused to accept equipment", this, source, destination);
                        // Go back to source
                        if (source.addEquipment(this, null, false)) {
                            return false;
                        } else {
                            console.error("Equipment lost in bad exchange !", this, source, destination);
                            return true;
                        }
                    }
                } else {
                    console.error("Source container refused to give away equipment", this, source, destination);
                    return false;
                }
            } else {
                return false;
            }
        }

        /**
         * Fill a tooltip with equipment data
         */
        fillTooltip(filler: TooltipFiller): boolean {
            let title = this.item.getFullName();
            if (this.item.slot_type !== null) {
                title += ` (${SlotType[this.item.slot_type]})`;
            }
            filler.addText(0, 0, title, "#cccccc", 20, false, true);
            filler.addText(0, 40, this.item.getFullDescription(), "#cccccc", 18, false, false, 700);
            return true;
        }
    }
}

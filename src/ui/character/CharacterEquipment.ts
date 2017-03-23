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
        tooltip: string
        price: number

        constructor(sheet: CharacterSheet, equipment: Equipment, container: CharacterEquipmentContainer) {
            let icon = sheet.game.cache.checkImageKey(`equipment-${equipment.code}`) ? `equipment-${equipment.code}` : `battle-actions-${equipment.action.code}`;
            super(sheet.game, 0, 0, icon);

            this.sheet = sheet;
            this.item = equipment;
            this.container = container;
            this.tooltip = equipment.name;
            this.price = 0;

            this.container.addEquipment(this, null, false);

            this.anchor.set(0.5, 0.5);

            this.setupDragDrop(sheet);
            this.snapToContainer();

            // TODO better tooltip (with equipment characteristics)
            sheet.view.tooltip.bindDynamicText(this, () => this.tooltip);
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
            this.events.onDragUpdate.add(() => {
                let destination = this.findContainerAt(this.x, this.y);
                if (destination) {
                    this.applyDragDrop(this.container, destination, true);
                }
            });
            this.events.onDragStop.add(() => {
                let destination = this.findContainerAt(this.x, this.y);
                if (destination) {
                    this.applyDragDrop(this.container, destination, false);
                    sheet.refresh();
                } else {
                    this.snapToContainer();
                }
            });
        }

        /**
         * Apply drag and drop between two containers
         */
        applyDragDrop(source: CharacterEquipmentContainer, destination: CharacterEquipmentContainer, hold: boolean) {
            if (source.removeEquipment(this, destination, true) && destination.addEquipment(this, source, true)) {
                if (!hold) {
                    if (source.removeEquipment(this, destination, false)) {
                        if (!destination.addEquipment(this, source, false)) {
                            console.error("Destination container refused to accept equipment", this, source, destination);
                            // Go back to source
                            if (!source.addEquipment(this, null, true)) {
                                console.error("Equipment lost in bad exchange !", this, source, destination);
                            }
                        }
                    } else {
                        console.error("Source container refused to give away equipment", this, source, destination);
                    }
                }
            }
        }
    }
}

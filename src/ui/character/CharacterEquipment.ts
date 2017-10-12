module TK.SpaceTac.UI {
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
        getEquipmentAnchor(): { x: number, y: number, scale: number, alpha: number }
        /**
         * Get a vertical offset to position the price tag
         */
        getPriceOffset(): number
        /**
         * Add an equipment to the container
         */
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer
        /**
         * Remove an equipment from the container
         */
        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer
    }

    /**
     * Result of an equipment transfer operation
     */
    export type CharacterEquipmentTransfer = {
        success: boolean,
        info: string,
        error?: string
    }

    function mergeTransfer(leave: CharacterEquipmentTransfer, enter: CharacterEquipmentTransfer): CharacterEquipmentTransfer {
        return {
            success: leave.success && enter.success,
            info: [leave.info, enter.info].join(', '),
            error: leave.error || enter.error
        }
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
            let icon = sheet.view.getImageInfo(`equipment-${equipment.code}`);
            super(sheet.game, 0, 0, icon.key, undefined, undefined, icon.frame, icon.frame);

            this.sheet = sheet;
            this.item = equipment;
            this.container = container;
            this.price = 0;

            this.anchor.set(0.5, 0.5);

            this.setupDragDrop();
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

            let tag = this.sheet.view.newImage("character-price-tag");
            let yoffset = this.container.getPriceOffset();
            tag.position.set(0, -yoffset * 2 + tag.height);
            tag.anchor.set(0.5, 0.5);
            tag.scale.set(2, 2);
            tag.alpha = 0.85;
            this.addChild(tag);

            let text = this.sheet.view.newText(price.toString(), -8, 2, 18, "#ffffcc");
            tag.addChild(text);
        }

        /**
         * Snap in place to its current container
         */
        snapToContainer() {
            let info = this.container.getEquipmentAnchor();
            this.position.set(info.x, info.y);
            this.scale.set(0.5 * info.scale, 0.5 * info.scale);
            this.alpha = info.alpha;
        }

        /**
         * Enable dragging to another slot
         */
        setupDragDrop() {
            if (this.container.removeEquipment(this, null, true)) {
                this.sheet.view.inputs.setDragDrop(this, () => {
                    // Drag
                    this.scale.set(0.5, 0.5);
                    this.alpha = 0.8;
                }, () => {
                    // Drop
                    this.sheet.setActionMessage();
                    let destination = this.findContainerAt(this.x, this.y);
                    if (destination && destination != this.container) {
                        if (this.applyDragDrop(this.container, destination, false).success) {
                            this.container = destination;
                            this.snapToContainer();
                            this.setupDragDrop();
                            this.sheet.refresh();  // TODO Only if required (destination is "virtual")
                        } else {
                            this.snapToContainer();
                        }
                    } else {
                        this.snapToContainer();
                    }
                }, () => {
                    // Update
                    let destination = this.findContainerAt(this.x, this.y);
                    if (destination && destination != this.container) {
                        let simulation = this.applyDragDrop(this.container, destination, true);
                        let message = capitalize(simulation.info);
                        if (simulation.error) {
                            message += ` (${simulation.error})`;
                        }
                        this.sheet.setActionMessage(message, simulation.success ? "#ffffff" : "#f04240");
                    } else {
                        this.sheet.setActionMessage();
                    }
                });
            } else {
                this.sheet.view.inputs.setDragDrop(this);
            }
        }

        /**
         * Apply drag and drop between two containers
         * 
         * Return true if something changed (or would change, if test=true).
         */
        applyDragDrop(source: CharacterEquipmentContainer, destination: CharacterEquipmentContainer, test: boolean): CharacterEquipmentTransfer {
            let transfer_test = mergeTransfer(source.removeEquipment(this, destination, true), destination.addEquipment(this, source, true));

            if (test) {
                return transfer_test;
            } else if (transfer_test.success) {
                let transfer_out = source.removeEquipment(this, destination, false);
                if (transfer_out.success) {
                    let transfer_in = destination.addEquipment(this, source, false);
                    let transfer = mergeTransfer(transfer_out, transfer_in);
                    if (transfer_in.success) {
                        return transfer;
                    } else {
                        console.error("Destination container refused to accept equipment", this, source, destination);
                        // Go back to source
                        let transfer_back = source.addEquipment(this, null, false);
                        if (transfer_back.success) {
                            return transfer;
                        } else {
                            console.error("Equipment lost in bad exchange!", this, source, destination);
                            return {
                                success: true,
                                info: transfer.info,
                                error: "Equipment was critically damaged in transfer!"
                            };
                        }
                    }
                } else {
                    console.error("Source container refused to give away equipment", this, source, destination);
                    return transfer_out;
                }
            } else {
                return transfer_test;
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
            filler.text(title, 0, 0, { color: "#cccccc", size: 20, bold: true });
            filler.text(this.item.getFullDescription(), 0, 40, { color: "#cccccc", size: 18, width: 700 });
            return true;
        }
    }
}

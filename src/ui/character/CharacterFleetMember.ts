/// <reference path="CharacterEquipment.ts" />

module TK.SpaceTac.UI {
    /**
     * Display a fleet member in the side of character sheet
     */
    export class CharacterFleetMember extends Phaser.Button implements CharacterEquipmentContainer {
        sheet: CharacterSheet;
        ship: Ship;
        levelup: Phaser.Image;

        constructor(sheet: CharacterSheet, x: number, y: number, ship: Ship) {
            let info = sheet.view.getImageInfo("character-ship");
            super(sheet.game, x, y, info.key, () => sheet.show(ship), null, info.frame, info.frame);
            this.anchor.set(0.5, 0.5);

            this.sheet = sheet;
            this.ship = ship;

            let portrait_pic = sheet.view.newImage(`ship-${ship.model.code}-portrait`);
            portrait_pic.anchor.set(0.5, 0.5);
            this.addChild(portrait_pic);

            this.levelup = sheet.view.newImage("character-upgrade-available", this.width / 2 - 40, -this.height / 2 + 40);
            this.levelup.anchor.set(1, 0);
            this.levelup.visible = this.ship.getAvailableUpgradePoints() > 0;
            this.addChild(this.levelup);

            sheet.view.tooltip.bindDynamicText(this, () => ship.getFullName());
        }

        /**
         * Set the selected state of the ship
         */
        setSelected(selected: boolean) {
            this.sheet.view.changeImage(this, selected ? "character-ship-selected" : "character-ship");
            this.sheet.view.animations.setVisible(this.levelup, this.ship.getAvailableUpgradePoints() > 0, 200);
        }

        /**
         * CharacterEquipmentContainer interface
         */
        isInside(x: number, y: number): boolean {
            return this.getBounds().contains(x, y) && this.ship !== this.sheet.ship;
        }
        getEquipmentAnchor(): { x: number, y: number, scale: number, alpha: number } {
            // not needed, equipment is never shown snapped in the slot
            return { x: 0, y: 0, scale: 1, alpha: 1 };
        }
        getPriceOffset(): number {
            return 0;
        }
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
            let info = `transfer to ${this.ship.name}`;
            if (this.ship.critical) {
                return { success: false, info: info, error: "not a fleet member" };
            } else if (this.ship != this.sheet.ship && equipment.item.slot_type !== null) {
                // First, try to equip
                let slot = this.ship.getFreeSlot(equipment.item.slot_type);
                if (slot && equipment.item.canBeEquipped(this.ship.attributes, false)) {
                    info = `equip on ${this.ship.name}`;
                    if (test) {
                        return { success: true, info: info };
                    } else {
                        let success = this.ship.equip(equipment.item, false);
                        return { success: true, info: info };
                    }
                }

                // If cannot be equipped, go to cargo
                if (this.ship.getFreeCargoSpace() > 0) {
                    if (test) {
                        return { success: true, info: info };
                    } else {
                        let success = this.ship.addCargo(equipment.item);
                        return { success: success, info: info };
                    }
                } else {
                    return { success: false, info: info, error: "not enough cargo space" };
                }
            } else {
                return { success: false, info: info, error: "drop on cargo or slots" };
            }
        }
        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
            // should never happen
            return { success: false, info: "" };
        }
    }
}

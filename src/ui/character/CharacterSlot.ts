/// <reference path="CharacterEquipment.ts" />

module TK.SpaceTac.UI {
    /**
     * Display a ship slot, with equipment attached to it
     */
    export class CharacterSlot extends Phaser.Image implements CharacterEquipmentContainer {
        sheet: CharacterSheet;

        constructor(sheet: CharacterSheet, x: number, y: number, slot: SlotType) {
            let info = sheet.view.getImageInfo("character-equipment-slot");
            super(sheet.game, x, y, info.key, info.frame);

            this.sheet = sheet;

            let sloticon = sheet.view.newButton(`character-slot-${SlotType[slot].toLowerCase()}`, 150, 150);
            sloticon.anchor.set(0.5);
            this.addChild(sloticon);
            sheet.view.tooltip.bindStaticText(sloticon, `${SlotType[slot]} slot`);
        }


        /**
         * CharacterEquipmentContainer interface
         */
        isInside(x: number, y: number): boolean {
            return this.getBounds().contains(x, y);
        }
        getEquipmentAnchor(): { x: number, y: number, scale: number, alpha: number } {
            return {
                x: this.x + this.parent.x + 84 * this.scale.x,
                y: this.y + this.parent.y + 83 * this.scale.y,
                scale: this.scale.x,
                alpha: this.alpha,
            }
        }
        getPriceOffset(): number {
            return 66;
        }
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
            let info = equipment.item.slot_type ? `equip in ${SlotType[equipment.item.slot_type].toLowerCase()} slot` : "equip";
            if (this.sheet.ship.critical) {
                return { success: false, info: info, error: "not a fleet member" };
            } else if (!equipment.item.canBeEquipped(this.sheet.ship.attributes, false)) {
                return { success: false, info: info, error: "missing skills" };
            } else if (equipment.item.slot_type && !this.sheet.ship.getFreeSlot(equipment.item.slot_type)) {
                return { success: false, info: info, error: "no free slot" };
            } else {
                if (test) {
                    return { success: true, info: info };
                } else {
                    let success = this.sheet.ship.equip(equipment.item, false);
                    return { success: success, info: info };
                }
            }
        }
        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
            let info = equipment.item.slot_type ? `unequip from ${SlotType[equipment.item.slot_type].toLowerCase()} slot` : "unequip";
            if (this.sheet.ship.critical) {
                return { success: false, info: info, error: "not a fleet member" };
            } if (!contains(this.sheet.ship.listEquipment(equipment.item.slot_type), equipment.item)) {
                return { success: false, info: info, error: "not equipped!" };
            } else {
                if (test) {
                    return { success: true, info: info };
                } else {
                    let success = this.sheet.ship.unequip(equipment.item, false);
                    return { success: success, info: info };
                }
            }
        }
    }
}

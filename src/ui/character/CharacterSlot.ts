/// <reference path="CharacterEquipment.ts" />

module TK.SpaceTac.UI {
    /**
     * Display a ship slot, with equipment attached to it
     */
    export class CharacterSlot extends Phaser.Image implements CharacterEquipmentContainer {
        sheet: CharacterSheet;

        constructor(sheet: CharacterSheet, x: number, y: number, slot: SlotType) {
            super(sheet.game, x, y, "character-equipment-slot");

            this.sheet = sheet;

            let sloticon = new Phaser.Button(this.game, 150, 150, `character-slots`);
            sloticon.frame = slot;
            sloticon.anchor.set(0.5, 0.5);
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
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): boolean {
            if (this.sheet.ship.critical) {
                return false;
            } if (this.sheet.ship.canEquip(equipment.item)) {
                if (test) {
                    return true;
                } else {
                    return this.sheet.ship.equip(equipment.item, false);
                }
            } else {
                return false;
            }
        }
        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): boolean {
            if (this.sheet.ship.critical) {
                return false;
            } if (contains(this.sheet.ship.listEquipment(equipment.item.slot_type), equipment.item)) {
                if (test) {
                    return true;
                } else {
                    return this.sheet.ship.unequip(equipment.item, false);
                }
            } else {
                return false;
            }
        }
    }
}

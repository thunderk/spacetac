/// <reference path="CharacterEquipment.ts" />

module TK.SpaceTac.UI {
    /**
     * Display a ship cargo slot
     */
    export class CharacterCargo extends Phaser.Image implements CharacterEquipmentContainer {
        sheet: CharacterSheet;

        constructor(sheet: CharacterSheet, x: number, y: number) {
            let info = sheet.view.getImageInfo("character-cargo-slot");
            super(sheet.game, x, y, info.key, info.frame);

            this.sheet = sheet;
        }

        jasmineToString() {
            return "CharacterCargo";
        }

        /**
         * CharacterEquipmentContainer interface
         */
        isInside(x: number, y: number): boolean {
            return this.getBounds().contains(x, y);
        }
        getEquipmentAnchor(): { x: number, y: number, scale: number, alpha: number } {
            return {
                x: this.x + (this.parent ? this.parent.x : 0) + 98 * this.scale.x,
                y: this.y + (this.parent ? this.parent.y : 0) + 98 * this.scale.y,
                scale: this.scale.x * 1.25,
                alpha: this.alpha,
            }
        }
        getPriceOffset(): number {
            return 66;
        }
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
            let info = "put in cargo";
            if (this.sheet.ship.critical) {
                return { success: false, info: info, error: "not a fleet member" };
            } if (this.sheet.ship.getFreeCargoSpace() > 0) {
                if (test) {
                    return { success: true, info: info };
                } else {
                    let success = this.sheet.ship.addCargo(equipment.item);
                    return { success: success, info: info };
                }
            } else {
                return { success: false, info: info, error: "not enough cargo space" };
            }
        }
        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
            let info = "remove from cargo";
            if (this.sheet.ship.critical) {
                return { success: false, info: info, error: "not a fleet member" };
            } else if (contains(this.sheet.ship.cargo, equipment.item)) {
                if (test) {
                    return { success: true, info: info };
                } else {
                    let success = this.sheet.ship.removeCargo(equipment.item);
                    return { success: success, info: info };
                }
            } else {
                return { success: false, info: info, error: "not in cargo!" };
            }
        }
    }
}

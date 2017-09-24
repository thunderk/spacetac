/// <reference path="CharacterEquipment.ts" />

module TK.SpaceTac.UI {
    /**
     * Display a ship cargo slot
     */
    export class CharacterCargo extends Phaser.Image implements CharacterEquipmentContainer {
        sheet: CharacterSheet;

        constructor(sheet: CharacterSheet, x: number, y: number) {
            super(sheet.game, x, y, "character-cargo-slot");

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
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): boolean {
            if (this.sheet.ship.critical) {
                return false;
            } if (this.sheet.ship.getFreeCargoSpace() > 0) {
                if (test) {
                    return true;
                } else {
                    return this.sheet.ship.addCargo(equipment.item);
                }
            } else {
                return false;
            }
        }
        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): boolean {
            if (this.sheet.ship.critical) {
                return false;
            } else if (contains(this.sheet.ship.cargo, equipment.item)) {
                if (test) {
                    return true;
                } else {
                    return this.sheet.ship.removeCargo(equipment.item);
                }
            } else {
                return false;
            }
        }
    }
}

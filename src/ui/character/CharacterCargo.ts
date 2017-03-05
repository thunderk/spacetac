module TS.SpaceTac.UI {
    /**
     * Display a ship cargo slot
     */
    export class CharacterCargo extends Phaser.Image {
        constructor(sheet: CharacterSheet, x: number, y: number) {
            super(sheet.game, x, y, "character-cargo-slot");
        }

        /**
         * Set the equipment displayed in the slot
         */
        setEquipment(equipment: CharacterEquipment | null) {
            this.addChild(equipment);
            equipment.position.set(98, 98);
        }
    }
}

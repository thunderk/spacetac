module TS.SpaceTac.UI {
    /**
     * Display a ship slot, with equipment attached to it
     */
    export class CharacterSlot extends Phaser.Image {
        constructor(sheet: CharacterSheet, x: number, y: number, slot: SlotType) {
            super(sheet.game, x, y, "character-equipment-slot");

            let sloticon = new Phaser.Image(this.game, 150, 150, `character-slot-${SlotType[slot].toLowerCase()}`);
            sloticon.anchor.set(0.5, 0.5);
            this.addChild(sloticon);
        }
    }
}

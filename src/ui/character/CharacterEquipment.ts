module TS.SpaceTac.UI {
    /**
     * Display a ship equipment, either attached to a slot, in cargo, or being dragged down
     */
    export class CharacterEquipment extends Phaser.Image {
        constructor(sheet: CharacterSheet, equipment: Equipment) {
            let action_icon = equipment.action != null && !(equipment.action instanceof MoveAction);
            super(sheet.game, 0, 0, action_icon ? `battle-actions-${equipment.action.code}` : `equipment-${equipment.code}`);

            this.anchor.set(0.5, 0.5);
            this.scale.set(0.5, 0.5);
        }
    }
}

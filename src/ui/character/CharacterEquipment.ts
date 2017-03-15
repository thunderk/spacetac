module TS.SpaceTac.UI {
    /**
     * Interface for any graphical item that may receive an equipment as drop destination
     */
    export interface CharacterEquipmentDestination {
        canDropEquipment(equipment: Equipment, x: number, y: number): CharacterEquipmentDrop | null;
    }

    /**
     * Display a ship equipment, either attached to a slot, in cargo, or being dragged down
     */
    export class CharacterEquipment extends Phaser.Button {
        equipment: Equipment;

        constructor(sheet: CharacterSheet, equipment: Equipment) {
            let icon = sheet.game.cache.checkImageKey(`equipment-${equipment.code}`) ? `equipment-${equipment.code}` : `battle-actions-${equipment.action.code}`;
            super(sheet.game, 0, 0, icon);

            this.equipment = equipment;

            this.anchor.set(0.5, 0.5);
            this.scale.set(0.5, 0.5);

            this.setupDragDrop(sheet);

            // TODO better tooltip
            sheet.view.tooltip.bindStaticText(this, equipment.name);
        }

        /**
         * Enable dragging to another slot
         */
        setupDragDrop(sheet: CharacterSheet) {
            this.inputEnabled = true;
            this.input.enableDrag(false, true);

            let origin: [number, number, number, number] | null = null;
            let drop: CharacterEquipmentDrop | null = null;
            this.events.onDragStart.add(() => {
                origin = [this.x, this.y, this.scale.x, this.scale.y];
                this.scale.set(0.5, 0.5);
                this.alpha = 0.8;
            });
            this.events.onDragUpdate.add(() => {
                drop = sheet.canDropEquipment(this.equipment, this.x, this.y);
            });
            this.events.onDragStop.add(() => {
                if (drop) {
                    drop.callback(this.equipment);
                    sheet.refresh();
                } else {
                    if (origin) {
                        this.position.set(origin[0], origin[1]);
                        this.scale.set(origin[2], origin[3]);
                        origin = null;
                    }
                    this.alpha = 1;
                }
            });
        }

        /**
         * Set the scaling of container in which the equipment icon is snapped
         */
        setContainerScale(scale: number) {
            this.scale.set(0.5 * scale, 0.5 * scale);
        }
    }
}

/// <reference path="BaseBattleEvent.ts"/>

module TS.SpaceTac {
    /**
     * Event logged when a list of active effects changes
     */
    export class ActiveEffectsEvent extends BaseLogShipEvent {
        // Effects active because of equipment
        equipment: BaseEffect[]

        // Sticky effects active
        sticky: StickyEffect[]

        // Area effects
        area: BaseEffect[]

        constructor(ship: Ship, equipment: BaseEffect[] = [], sticky: StickyEffect[] = [], area: BaseEffect[] = []) {
            super("activeeffects", ship);

            this.equipment = equipment.map(copy);
            this.sticky = sticky.map(copy);
            this.area = area.map(copy);
        }
    }
}

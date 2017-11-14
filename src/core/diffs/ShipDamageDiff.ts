/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A ship takes damage (to hull or shield)
     * 
     * This does not apply the damage on ship values (there are ShipValueDiff for this), but apply equipment wear.
     */
    export class ShipDamageDiff extends BaseBattleShipDiff {
        // Damage to hull
        hull: number

        // Damage to shield
        shield: number

        constructor(ship: Ship, hull: number, shield: number) {
            super(ship);

            this.hull = hull;
            this.shield = shield;
        }

        protected applyOnShip(ship: Ship, battle: Battle): void {
            if (this.shield > 0) {
                ship.listEquipment(SlotType.Shield).forEach(equipment => equipment.addWear(Math.ceil(this.shield * 0.1)));
            }
            if (this.hull > 0) {
                ship.listEquipment(SlotType.Hull).forEach(equipment => equipment.addWear(Math.ceil(this.hull * 0.1)));
            }
        }

        protected revertOnShip(ship: Ship, battle: Battle): void {
            if (this.shield > 0) {
                ship.listEquipment(SlotType.Shield).forEach(equipment => equipment.addWear(-Math.ceil(this.shield * 0.1)));
            }
            if (this.hull > 0) {
                ship.listEquipment(SlotType.Hull).forEach(equipment => equipment.addWear(-Math.ceil(this.hull * 0.1)));
            }
        }
    }
}

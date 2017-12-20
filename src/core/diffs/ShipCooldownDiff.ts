/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A ship's equipment cools down
     */
    export class ShipCooldownDiff extends BaseBattleShipDiff {
        // Equipment to cool
        equipment: RObjectId

        // Quantity of heat to dissipate
        heat: number

        constructor(ship: Ship | RObjectId, equipment: Equipment | RObjectId, heat: number) {
            super(ship);

            this.equipment = (equipment instanceof Equipment) ? equipment.id : equipment;
            this.heat = heat;
        }

        applyOnShip(ship: Ship, battle: Battle) {
            let equipment = ship.getEquipment(this.equipment);
            if (equipment) {
                equipment.cooldown.heat -= this.heat;
                if (equipment.cooldown.heat == 0) {
                    equipment.cooldown.uses = 0;
                }
            } else {
                console.error("Cannot apply diff, equipment not found", this);
            }
        }

        revertOnShip(ship: Ship, battle: Battle) {
            let equipment = ship.getEquipment(this.equipment);
            if (equipment) {
                if (equipment.cooldown.heat == 0) {
                    equipment.cooldown.uses = equipment.cooldown.overheat;
                }
                equipment.cooldown.heat += this.heat;
            } else {
                console.error("Cannot revert diff, equipment not found", this);
            }
        }
    }
}

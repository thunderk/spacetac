/// <reference path="../LootTemplate.ts"/>

module SpaceTac.Game.Equipments {
    "use strict";

    // Base convenience class for weapons
    export class AbstractWeapon extends LootTemplate {
        // Boolean set to true if the weapon can target space
        can_target_space: boolean;

        constructor(name: string, min_damage: number, max_damage: number = null) {
            super(SlotType.Weapon, name);

            this.can_target_space = false;

            this.addDamageOnTargetEffect(min_damage, max_damage);
        }

        // Set the range for this weapon
        //  Pay attention that *min_distance* means the MAXIMAL reachable distance, but on a low-power loot
        setRange(min_distance: number, max_distance: number = null, can_target_space: boolean = false): void {
            this.distance = new Range(min_distance, max_distance);
            this.can_target_space = can_target_space;
        }

        protected getActionForEquipment(equipment: Equipment): BaseAction {
            var result = new FireWeaponAction(equipment, this.can_target_space);
            return result;
        }
    }
}

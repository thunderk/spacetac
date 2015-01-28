/// <reference path="../LootTemplate.ts"/>

module SpaceTac.Game.Equipments {
    "use strict";

    // Base convenience class for weapons
    export class AbstractWeapon extends LootTemplate {
        constructor(name: string, min_damage: number, max_damage: number=null) {
            super(SlotType.Weapon, name);

            this.addDamageOnTargetEffect(min_damage, max_damage);
        }

        protected getActionForEquipment(equipment: Equipment): BaseAction {
            var result = new FireWeaponAction();
            return result;
        }
    }
}

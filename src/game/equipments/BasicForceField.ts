/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Game.Equipments {
    export class BasicForceField extends LootTemplate {
        constructor() {
            super(SlotType.Shield, "Basic Force Field");

            this.min_level = new IntegerRange(1, 3);

            this.addPermanentAttributeMaxEffect(AttributeCode.Shield, 100, 200);
        }
    }
}

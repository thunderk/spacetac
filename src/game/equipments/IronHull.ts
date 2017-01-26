/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Game.Equipments {
    export class IronHull extends LootTemplate {
        constructor() {
            super(SlotType.Armor, "IronHull");

            this.min_level = new IntegerRange(1, 3);

            this.addPermanentAttributeMaxEffect(AttributeCode.Hull, 100, 200);
        }
    }
}

/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Game.Equipments {
    export class BasicPowerCore extends LootTemplate {
        constructor() {
            super(SlotType.Power, "Basic Power Core");

            this.min_level = new IntegerRange(1, 1);

            this.addPermanentAttributeMaxEffect(AttributeCode.Initiative, 1);
            this.addPermanentAttributeMaxEffect(AttributeCode.AP, 8);
            this.addPermanentAttributeValueEffect(AttributeCode.AP_Initial, 5);
            this.addPermanentAttributeValueEffect(AttributeCode.AP_Recovery, 4);
        }
    }
}

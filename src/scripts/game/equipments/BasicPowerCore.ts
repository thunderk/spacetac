/// <reference path="../LootTemplate.ts"/>

module SpaceTac.Game.Equipments {
    "use strict";

    export class BasicPowerCore extends LootTemplate {
        constructor() {
            super(SlotType.Power, "Basic Power Core");

            this.min_level = new IntegerRange(1, 1);
            this.addPermanentAttributeMaxEffect(AttributeCode.AP, 8);
        }
    }
}

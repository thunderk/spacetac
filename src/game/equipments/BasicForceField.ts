/// <reference path="../LootTemplate.ts"/>

module SpaceTac.Game.Equipments {
    "use strict";

    export class BasicForceField extends LootTemplate {
        constructor() {
            super(SlotType.Shield, "Basic Force Field");

            this.min_level = new IntegerRange(1, 3);

            this.addPermanentAttributeMaxEffect(AttributeCode.Shield, 100, 200);
        }
    }
}

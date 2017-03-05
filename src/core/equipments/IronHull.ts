/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class IronHull extends LootTemplate {
        constructor() {
            super(SlotType.Hull, "IronHull");

            this.min_level = new IntegerRange(1, 3);

            this.increaseAttribute("hull_capacity", 200, 300);
        }
    }
}

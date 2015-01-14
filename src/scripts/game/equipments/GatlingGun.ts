/// <reference path="../LootTemplate.ts"/>

module SpaceTac.Game.Equipments {
    "use strict";

    // Equipment: Gatling Gun
    export class GatlingGun extends LootTemplate {
        constructor() {
            super(SlotType.Weapon, "Gatling Gun");

            this.distance = new Range(20, 30);
            this.ap_usage = new Range(3, 4);
            this.min_level = new IntegerRange(1, 3);
        }
    }
}

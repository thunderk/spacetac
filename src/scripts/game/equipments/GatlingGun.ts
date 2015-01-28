/// <reference path="AbstractWeapon.ts"/>

module SpaceTac.Game.Equipments {
    "use strict";

    // Equipment: Gatling Gun
    export class GatlingGun extends AbstractWeapon {
        constructor() {
            super("Gatling Gun", 10, 20);

            this.distance = new Range(20, 30);
            this.ap_usage = new Range(3, 4);
            this.min_level = new IntegerRange(1, 3);
        }
    }
}

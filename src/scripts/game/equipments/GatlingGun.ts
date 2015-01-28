/// <reference path="AbstractWeapon.ts"/>

module SpaceTac.Game.Equipments {
    "use strict";

    // Equipment: Gatling Gun
    export class GatlingGun extends AbstractWeapon {
        constructor() {
            super("Gatling Gun", 50, 100);

            this.setRange(300, 300, false);

            this.ap_usage = new Range(3, 4);
            this.min_level = new IntegerRange(1, 3);
        }
    }
}

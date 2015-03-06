/// <reference path="AbstractWeapon.ts"/>

module SpaceTac.Game.Equipments {
    "use strict";

    export class GatlingGun extends AbstractWeapon {
        constructor() {
            super("Gatling Gun", 50, 100);

            this.setRange(500, 500, false);

            this.ap_usage = new Range(2, 3);
            this.min_level = new IntegerRange(1, 3);
        }
    }
}

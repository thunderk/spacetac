/// <reference path="AbstractWeapon.ts"/>

module TS.SpaceTac.Equipments {
    export class GatlingGun extends AbstractWeapon {
        constructor() {
            super("Gatling Gun", 50, 100);

            this.setRange(400, 400, false);

            this.ap_usage = new IntegerRange(3, 4);
            this.min_level = new IntegerRange(1, 3);
        }
    }
}

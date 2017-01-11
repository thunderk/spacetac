/// <reference path="AbstractWeapon.ts"/>

module SpaceTac.Game.Equipments {
    export class GatlingGun extends AbstractWeapon {
        constructor() {
            super("Gatling Gun", 50, 100);

            this.setRange(400, 400, false);

            this.ap_usage = new IntegerRange(2, 3);
            this.min_level = new IntegerRange(1, 3);
        }
    }
}

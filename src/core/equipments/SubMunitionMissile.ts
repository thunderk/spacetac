/// <reference path="AbstractWeapon.ts"/>

module TS.SpaceTac.Equipments {
    export class SubMunitionMissile extends AbstractWeapon {
        constructor() {
            super("SubMunition Missile", 30, 50);

            this.setRange(300, 400, true);
            this.setBlast(100, 150);

            this.ap_usage = new IntegerRange(4, 5);
            this.min_level = new IntegerRange(1, 3);
        }
    }
}

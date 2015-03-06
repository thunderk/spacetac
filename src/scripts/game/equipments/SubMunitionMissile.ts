/// <reference path="AbstractWeapon.ts"/>

module SpaceTac.Game.Equipments {
    "use strict";

    export class SubMunitionMissile extends AbstractWeapon {
        constructor() {
            super("SubMunition Missile", 30, 50);

            this.setRange(350, 400, true);
            this.setBlast(150, 200);

            this.ap_usage = new Range(4, 5);
            this.min_level = new IntegerRange(1, 3);
        }
    }
}

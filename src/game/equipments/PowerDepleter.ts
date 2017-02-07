/// <reference path="AbstractWeapon.ts"/>

module TS.SpaceTac.Game.Equipments {
    export class PowerDepleter extends AbstractWeapon {
        constructor() {
            super("Power Depleter");

            this.setRange(200, 300, false);

            this.ap_usage = new IntegerRange(4, 5);
            this.min_level = new IntegerRange(1, 3);

            this.addSticky(new AttributeLimitEffect("power_capacity"), 4, 3, 1, 2, true);
        }
    }
}

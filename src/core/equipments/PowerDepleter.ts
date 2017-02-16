/// <reference path="AbstractWeapon.ts"/>

module TS.SpaceTac.Equipments {
    export class PowerDepleter extends AbstractWeapon {
        constructor() {
            super("Power Depleter");

            this.setRange(300, 400, false);

            this.ap_usage = new IntegerRange(4, 5);
            this.min_level = new IntegerRange(1, 3);

            this.addStickyEffect(new AttributeLimitEffect("power_capacity"), 4, 3, 2, 3, true);
        }
    }
}

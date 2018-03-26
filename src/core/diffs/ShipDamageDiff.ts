/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A ship takes damage (to hull or shield)
     * 
     * This is only informative, and does not apply the damage on ship values (there are ShipValueDiff for this).
     */
    export class ShipDamageDiff extends BaseBattleShipDiff {
        // Damage to hull
        hull: number

        // Damage to shield
        shield: number

        // Evaded damage
        evaded: number

        // Theoretical damage value
        theoretical: number

        constructor(ship: Ship, hull: number, shield: number, evaded = 0, theoretical = hull + shield + evaded) {
            super(ship);

            this.hull = hull;
            this.shield = shield;
            this.evaded = evaded;
            this.theoretical = theoretical;
        }
    }
}

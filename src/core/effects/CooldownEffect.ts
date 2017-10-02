/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Cools down equipment of affected ships
     */
    export class CooldownEffect extends BaseEffect {
        // Number of cooling steps to apply
        cooling: number

        // Maximal number of equipment to cool on one ship (will be chosen at random)
        maxcount: number

        constructor(cooling = 0, maxcount = 0) {
            super("cooldown");

            this.cooling = cooling;
            this.maxcount = maxcount;
        }

        applyOnShip(ship: Ship, source: Ship | Drone): boolean {
            let equipments = ship.listEquipment().filter(equ => equ.cooldown.heat > 0);

            if (this.maxcount && equipments.length > this.maxcount) {
                let random = RandomGenerator.global;
                equipments = random.sample(equipments, this.maxcount);
            }

            equipments.forEach(equ => equ.cooldown.cool(this.cooling || equ.cooldown.heat));

            return true;
        }

        isBeneficial(): boolean {
            return true;
        }

        getDescription(): string {
            return `${this.cooling ? this.cooling : "Full"} cooling (${this.maxcount ? this.maxcount : "all"} equipment${this.maxcount != 1 ? "s" : ""})`;
        }
    }
}

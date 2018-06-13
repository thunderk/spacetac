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

        getOnDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            let actions = ship.actions.listOverheated();

            if (this.maxcount && actions.length > this.maxcount) {
                let random = RandomGenerator.global;
                actions = random.sample(actions, this.maxcount);
            }

            return actions.map(action => new ShipCooldownDiff(ship, action, this.cooling || ship.actions.getCooldown(action).heat));
        }

        isBeneficial(): boolean {
            return true;
        }

        getDescription(): string {
            return `${this.cooling ? this.cooling : "full"} cooling (${this.maxcount ? this.maxcount : "all"} equipment${this.maxcount != 1 ? "s" : ""})`;
        }
    }
}

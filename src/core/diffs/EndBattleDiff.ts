/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A battle ends
     * 
     * This should be the last diff of a battle log
     */
    export class EndBattleDiff extends BaseBattleDiff {
        // Outcome of the battle
        outcome: BattleOutcome

        // Number of battle cycles
        cycles: number

        constructor(winner: Fleet | null, cycles: number) {
            super();

            this.outcome = new BattleOutcome(winner);
            this.cycles = cycles;
        }

        apply(battle: Battle): void {
            battle.outcome = this.outcome;

            iforeach(battle.iships(), ship => {
                ship.listEquipment().forEach(equipment => {
                    equipment.addWear(this.cycles);
                });
            });

            battle.stats.addFleetsValue(battle.fleets[0], battle.fleets[1], false);
        }

        revert(battle: Battle): void {
            battle.outcome = null;

            battle.stats.addFleetsValue(battle.fleets[0], battle.fleets[1], true);

            iforeach(battle.iships(), ship => {
                ship.listEquipment().forEach(equipment => {
                    equipment.addWear(-this.cycles);
                });
            });
        }
    }
}

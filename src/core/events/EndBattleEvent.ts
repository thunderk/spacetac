/// <reference path="BaseBattleEvent.ts"/>

module TK.SpaceTac {
    // Event logged when the battle ended
    //  This is always the last event of a battle log
    export class EndBattleEvent extends BaseBattleEvent {
        // Outcome of the battle
        outcome: BattleOutcome;

        constructor(outcome: BattleOutcome) {
            super("endbattle");

            this.outcome = outcome;
        }
    }
}

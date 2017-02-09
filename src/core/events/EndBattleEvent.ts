/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac {
    // Event logged when the battle ended
    //  This is always the last event of a battle log
    export class EndBattleEvent extends BaseLogEvent {
        // Outcome of the battle
        outcome: BattleOutcome;

        constructor(outcome: BattleOutcome) {
            super("endbattle");

            this.outcome = outcome;
        }
    }
}
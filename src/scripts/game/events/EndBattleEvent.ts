/// <reference path="BaseLogEvent.ts"/>

module SpaceTac.Game {
    "use strict";

    // Event logged when the battle ended
    //  This is always the last event of a battle log
    export class EndBattleEvent extends BaseLogEvent {
        // Winner of the battle
        winner: Player;

        constructor(winner: Player) {
            super("endbattle");

            this.winner = winner;
        }
    }
}

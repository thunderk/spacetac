/// <reference path="../common/DiffLog.ts" />

module TK.SpaceTac {
    /**
     * Log of diffs that change the state of a battle
     */
    export class BattleLog extends DiffLog<Battle> {
    }

    /**
     * Client for a battle log
     */
    export class BattleLogClient extends DiffLogClient<Battle> {
    }
}

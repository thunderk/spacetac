module SpaceTac.Game {
    // Base class for a BattleLog event
    export class BaseLogEvent {
        // Code of the event (its type)
        code: string;

        // The ship causing the event (the one whose turn it is to play)
        ship: Ship;

        // Target of the event
        target: Target;

        constructor(code: string, ship: Ship = null, target: Target = null) {
            this.code = code;
            this.ship = ship;
            this.target = target;
        }
    }
}
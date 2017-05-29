module TS.SpaceTac {
    /**
     * Base class for battle events
     * 
     * Events are the proper way to modify the battle state
     * 
     * All events may be applied either forward or backward on a battle state
     */
    export class BaseBattleEvent {
        // Code of the event (its type)
        code: string;

        // The ship causing the event (the one whose turn it is to play)
        ship: Ship | null;

        // Target of the event
        target: Target | null;

        // Boolean at true if the event is used to set initial battle conditions
        initial = false;

        constructor(code: string, ship: Ship | null = null, target: Target | null = null) {
            this.code = code;
            this.ship = ship;
            this.target = target;
        }

        /**
         * Apply the event forward on a battle state
         */
        apply(battle: Battle) {
        }

        /**
         * Apply the event backward (revert it) on a battle state
         */
        revert(battle: Battle) {
        }
    }

    // Base class for a BattleLog event linked to a ship
    export class BaseLogShipEvent extends BaseBattleEvent {
        ship: Ship;

        constructor(code: string, ship: Ship, target: Target | null = null) {
            super(code, ship, target);
        }
    }

    // Base class for a BattleLog event linked to a ship, and with a target
    export class BaseLogShipTargetEvent extends BaseLogShipEvent {
        target: Target;

        constructor(code: string, ship: Ship, target: Target) {
            super(code, ship, target);
        }
    }
}

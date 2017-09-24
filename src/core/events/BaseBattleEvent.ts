module TK.SpaceTac {
    /**
     * Base class for battle events
     * 
     * Events are the proper way to modify the battle state
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
         * Apply the event on a battle state
         * 
         * By default it does nothing
         */
        apply(battle: Battle) {
        }

        /**
         * Get the reverse event
         * 
         * By default it returns a stub event that does nothing
         */
        getReverse(): BaseBattleEvent {
            return new StubBattleEvent();
        }
    }

    /**
     * Battle event that does nothing
     */
    export class StubBattleEvent extends BaseBattleEvent {
        constructor() {
            super("stub");
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

module TK.SpaceTac {
    /**
     * Ship maneuver for an artifical intelligence
     * 
     * A maneuver is like a human player action, choosing an action and using it
     */
    export class Maneuver {
        // Concerned ship
        ship: Ship

        // Reference to battle
        battle: Battle

        // Action to use
        action: BaseAction

        // Target for the action
        target: Target

        // Result of move-fire simulation
        simulation: MoveFireResult

        // List of guessed effects of this maneuver (lazy property)
        _effects?: BaseBattleDiff[]

        constructor(ship: Ship, action: BaseAction, target: Target, move_margin = 1) {
            this.ship = ship;
            this.battle = nn(ship.getBattle());
            this.action = action;
            this.target = target;

            let simulator = new MoveFireSimulator(this.ship);
            this.simulation = simulator.simulateAction(this.action, this.target, move_margin);
        }

        jasmineToString() {
            return `Use ${this.action.code} on ${this.target.jasmineToString()}`;
        }

        get effects(): BaseBattleDiff[] {
            if (!this._effects) {
                let simulator = new MoveFireSimulator(this.ship);
                this._effects = simulator.getExpectedDiffs(this.battle, this.simulation);
            }
            return this._effects;
        }

        /**
         * Returns true if the maneuver has at least one part doable
         */
        isPossible(): boolean {
            return any(this.simulation.parts, part => part.possible);
        }

        /**
         * Returns true if the maneuver cannot be fully done this turn
         */
        isIncomplete(): boolean {
            return (this.simulation.need_move && !this.simulation.can_end_move) || (this.simulation.need_fire && !this.simulation.can_fire);
        }

        /**
         * Returns true if another maneuver could be done next on the same ship
         */
        mayContinue(): boolean {
            return this.ship.playing && !this.isIncomplete() && !(this.action instanceof EndTurnAction);
        }

        /**
         * Get the location of the ship after the action
         */
        getFinalLocation(): { x: number, y: number } {
            if (this.simulation.need_move) {
                return this.simulation.move_location;
            } else {
                return { x: this.ship.arena_x, y: this.ship.arena_y };
            }
        }

        /**
         * Get the total power usage of this maneuver
         */
        getPowerUsage(): number {
            return this.simulation.total_move_ap + this.simulation.total_fire_ap;
        }

        /**
         * Standard feedback for this maneuver. It will apply it on the battle state.
         */
        apply(battle: Battle): boolean {
            if (!this.ship.is(battle.playing_ship)) {
                console.error("Maneuver was not produced for the playing ship", this, battle);
                return false;
            } else if (!this.simulation.success) {
                return false;
            } else {
                let parts = this.simulation.parts;
                for (let i = 0; i < parts.length; i++) {
                    let part = parts[i];
                    if (part.action instanceof EndTurnAction || part.possible) {
                        if (!battle.applyOneAction(part.action.id, part.target)) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
                return this.mayContinue();
            }
        }
    }
}

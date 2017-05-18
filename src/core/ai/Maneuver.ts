module TS.SpaceTac {
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

        // List of guessed effects of this maneuver
        effects: [Ship, BaseEffect][]

        constructor(ship: Ship, action: BaseAction, target: Target, move_margin = 0.1) {
            this.ship = ship;
            this.battle = nn(ship.getBattle());
            this.action = action;
            this.target = target;

            let simulator = new MoveFireSimulator(this.ship);
            this.simulation = simulator.simulateAction(this.action, this.target, move_margin);

            this.effects = this.guessEffects();
        }

        jasmineToString() {
            return `Use ${this.action.code} on ${this.target.jasmineToString()}`;
        }

        /**
         * Apply the maneuver in current battle
         */
        apply(): void {
            if (this.simulation.success) {
                this.simulation.parts.filter(part => part.possible).forEach(part => {
                    if (!part.action.apply(this.ship, part.target)) {
                        console.error("AI cannot apply maneuver", this, part);
                    }
                });
            }
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
         * Guess what will be the effects applied on any ship by this maneuver
         */
        guessEffects(): [Ship, BaseEffect][] {
            let result: [Ship, BaseEffect][] = [];

            if (this.action instanceof FireWeaponAction) {
                result = result.concat(this.action.getEffects(this.ship, this.target));
            } else if (this.action instanceof DeployDroneAction) {
                let ships = this.battle.collectShipsInCircle(this.target, this.action.effect_radius, true);
                this.action.effects.forEach(effect => {
                    result = result.concat(ships.map(ship => <[Ship, BaseEffect]>[ship, effect]));
                });
            }

            return result;
        }
    }
}

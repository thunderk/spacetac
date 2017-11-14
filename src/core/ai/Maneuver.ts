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

        // List of guessed effects of this maneuver
        effects: [Ship, BaseEffect][]

        constructor(ship: Ship, action: BaseAction, target: Target, move_margin = 1) {
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
         * Guess what will be the effects applied on any ship by this maneuver
         */
        guessEffects(): [Ship, BaseEffect][] {
            let result: [Ship, BaseEffect][] = [];

            // Effects of weapon
            if (this.action instanceof TriggerAction) {
                result = result.concat(this.action.getEffects(this.ship, this.target));
            } else if (this.action instanceof DeployDroneAction) {
                let ships = this.battle.collectShipsInCircle(this.target, this.action.effect_radius, true);
                this.action.effects.forEach(effect => {
                    result = result.concat(ships.map(ship => <[Ship, BaseEffect]>[ship, effect]));
                });
            }

            // Area effects on final location
            let location = this.getFinalLocation();
            let effects = this.battle.drones.list().forEach(drone => {
                if (Target.newFromLocation(location.x, location.y).isInRange(drone.x, drone.y, drone.radius)) {
                    result = result.concat(drone.effects.map(effect => <[Ship, BaseEffect]>[this.ship, effect]));
                }
            });

            return result;
        }
    }
}

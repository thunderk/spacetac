module TK.SpaceTac {
    // Single effect of a maneuver
    export type ManeuverEffect = {
        ship: Ship
        effect: BaseEffect
        success: number
    }

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
        effects: ManeuverEffect[]

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
        guessEffects(): ManeuverEffect[] {
            let result: ManeuverEffect[] = [];

            // Effects of weapon
            if (this.action instanceof TriggerAction) {
                this.action.getEffects(this.ship, this.target).forEach(([ship, effect, success]) => {
                    result.push({ ship: ship, effect: effect, success: success });
                })
            } else if (this.action instanceof DeployDroneAction) {
                let ships = this.battle.collectShipsInCircle(this.target, this.action.drone_radius, true);
                this.action.drone_effects.forEach(effect => {
                    result = result.concat(ships.map(ship => ({ ship: ship, effect: effect, success: 1 })));
                });
            }

            // Area effects on final location
            let location = this.getFinalLocation();
            let effects = this.battle.drones.list().forEach(drone => {
                if (Target.newFromLocation(location.x, location.y).isInRange(drone.x, drone.y, drone.radius)) {
                    result = result.concat(drone.effects.map(effect => (
                        { ship: this.ship, effect: effect, success: 1 }
                    )));
                }
            });

            return result;
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
                        return battle.applyOneAction(part.action.id, part.target);
                    } else {
                        return false;
                    }
                }
                return this.mayContinue();
            }
        }
    }
}

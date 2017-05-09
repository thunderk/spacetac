module TS.SpaceTac {
    /**
     * Ship maneuver for an artifical intelligence
     * 
     * A maneuver is like a human player action, choosing an equipment and using it
     */
    export class Maneuver {
        // Concerned ship
        ship: Ship;

        // Equipment to use
        equipment: Equipment;

        // Target for the action;
        target: Target;

        // Result of move-fire simulation
        simulation: MoveFireResult;

        constructor(ship: Ship, equipment: Equipment, target: Target, move_margin = 0.1) {
            this.ship = ship;
            this.equipment = equipment;
            this.target = target;

            let simulator = new MoveFireSimulator(this.ship);
            this.simulation = simulator.simulateAction(this.equipment.action, this.target, move_margin);
        }

        jasmineToString() {
            return `Use ${this.equipment.jasmineToString()} on ${this.target.jasmineToString()}`;
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
    }
}

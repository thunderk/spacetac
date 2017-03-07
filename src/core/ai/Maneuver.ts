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

        constructor(ship: Ship, equipment: Equipment, target: Target, move_margin = 0) {
            this.ship = ship;
            this.equipment = equipment;
            this.target = target;

            let simulator = new MoveFireSimulator(this.ship);
            this.simulation = simulator.simulateAction(this.equipment.action, this.target, move_margin);
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
    }
}

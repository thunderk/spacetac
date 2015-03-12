module SpaceTac.Game.AI {
    "use strict";

    // Ship maneuver for an artifical intelligence
    //   A maneuver is like a human player action, choosing an equipment and using it
    export class AIManeuver {
        // Concerned ship
        ship: Ship;

        // Equipment to use
        equipment: Equipment;

        // Target for the action;
        target: Target;

        constructor(ship: Ship, equipment: Equipment, target: Target) {
            this.ship = ship;
            this.equipment = equipment;
            this.target = target;
        }

        // Apply the maneuver in current battle
        apply(): void {
            this.equipment.action.apply(this.ship.getBattle(), this.ship, this.target);
        }
    }
}

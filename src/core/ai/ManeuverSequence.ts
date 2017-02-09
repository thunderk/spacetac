module TS.SpaceTac {
    // A chain of Maneuver to execute sequentially
    export class ManeuverSequence {
        // Concerned ship
        ship: Ship;

        // Sequence of maneuvers
        maneuvers: Maneuver[];

        constructor(ship: Ship, maneuvers: Maneuver[]) {
            this.ship = ship;
            this.maneuvers = maneuvers;
        }
    }
}

module SpaceTac.Game {
    // A single ship in a Fleet
    export class Ship {
        // Fleet this ship is a member of
        fleet: Fleet;

        // Current level
        level: number;

        // Number of shield points
        shield: number;

        // Number of hull points
        hull: number;

        // Current initiative (high numbers will allow this ship to play sooner)
        initiative: number;
    }
}
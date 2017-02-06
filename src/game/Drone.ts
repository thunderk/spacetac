/// <reference path="Serializable.ts"/>

module TS.SpaceTac.Game {
    /**
     * Drones are static objects that apply effects in a circular zone around themselves.
     */
    export class Drone extends Serializable {
        // Ship that deployed the drone
        owner: Ship;

        // Location in arena
        x: number;
        y: number;
        radius: number;

        // Lifetime in number of turns (not including the initial effect on deployment)
        duration: number = 1;

        // Effects to apply
        effects: BaseEffect[] = [];

        // Ships registered inside the radius
        inside: Ship[] = [];

        // Ships starting their turn the radius
        inside_at_start: Ship[] = [];

        constructor(owner: Ship) {
            super();

            this.owner = owner;
        }

        /**
         * Call a function for each ship in radius.
         */
        forEachInRadius(ships: Ship[], callback: (ship: Ship) => any) {
            ships.forEach(ship => {
                if (ship.isInCircle(this.x, this.y, this.radius)) {
                    callback(ship);
                }
            });
        }

        /**
         * Apply the effects on a single ship.
         * 
         * This does not check if the ship is in range.
         */
        singleApply(ship: Ship) {
            this.effects.forEach(effect => effect.applyOnShip(ship));
        }

        /**
         * Called when the drone is first deployed.
         */
        onDeploy(ships: Ship[]) {
            this.forEachInRadius(ships, ship => this.singleApply(ship));
        }

        /**
         * Called when a ship turn starts
         * 
         * Returns false if the drone should be destroyed
         */
        onTurnStart(ship: Ship): boolean {
            if (ship == this.owner) {
                if (this.duration <= 1) {
                    return false;
                } else {
                    this.duration--;
                }
            }

            if (ship.isInCircle(this.x, this.y, this.radius)) {
                add(this.inside, ship);
                add(this.inside_at_start, ship);
            } else {
                remove(this.inside_at_start, ship);
            }
            return true;
        }

        /**
         * Called when a ship turn ends
         */
        onTurnEnd(ship: Ship) {
            if (ship.isInCircle(this.x, this.y, this.radius) && contains(this.inside_at_start, ship)) {
                this.singleApply(ship);
            }
        }

        /**
         * Called after a ship moved
         */
        onShipMove(ship: Ship) {
            if (ship.isInCircle(this.x, this.y, this.radius)) {
                if (add(this.inside, ship)) {
                    this.singleApply(ship);
                }
            } else {
                remove(this.inside, ship);
            }
        }
    }
}
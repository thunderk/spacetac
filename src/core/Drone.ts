module TS.SpaceTac {
    /**
     * Drones are static objects that apply effects in a circular zone around themselves.
     */
    export class Drone {
        // Code of the drone
        code: string;

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

        constructor(owner: Ship, code = "drone") {
            this.owner = owner;
            this.code = code;
        }

        /**
         * Filter the list of ships in radius.
         */
        filterShipsInRadius(ships: Ship[]): Ship[] {
            return ships.filter(ship => ship.isInCircle(this.x, this.y, this.radius));
        }

        /**
         * Apply the effects on a list of ships
         * 
         * This does not check if the ships are in range.
         */
        apply(ships: Ship[], log = true) {
            ships = ships.filter(ship => ship.alive);
            if (ships.length > 0) {
                let battle = this.owner.getBattle();
                if (battle && log) {
                    battle.log.add(new DroneAppliedEvent(this, ships));
                }
                ships.forEach(ship => this.effects.forEach(effect => effect.applyOnShip(ship)));
            }
        }

        /**
         * Called when the drone is first deployed.
         */
        onDeploy(ships: Ship[]) {
            this.apply(this.filterShipsInRadius(ships));
        }

        /**
         * Called when a ship turn starts
         */
        onTurnStart(ship: Ship) {
            if (ship == this.owner) {
                this.duration--;
            }

            if (this.duration <= 0) {
                if (this.owner) {
                    let battle = this.owner.getBattle();
                    if (battle) {
                        battle.removeDrone(this);
                    }
                }
                return;
            }

            if (ship.isInCircle(this.x, this.y, this.radius)) {
                add(this.inside, ship);
                add(this.inside_at_start, ship);
            } else {
                remove(this.inside_at_start, ship);
            }
        }

        /**
         * Called when a ship turn ends
         */
        onTurnEnd(ship: Ship) {
            if (this.duration > 0 && ship.isInCircle(this.x, this.y, this.radius) && contains(this.inside_at_start, ship)) {
                this.apply([ship]);
            }
        }

        /**
         * Called after a ship moved
         */
        onShipMove(ship: Ship) {
            if (this.duration > 0 && ship.isInCircle(this.x, this.y, this.radius)) {
                if (add(this.inside, ship)) {
                    this.apply([ship]);
                }
            } else {
                remove(this.inside, ship);
            }
        }
    }
}
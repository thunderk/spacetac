module TK.SpaceTac {
    /**
     * Error codes for approach simulation
     */
    export enum ApproachSimulationError {
        NO_MOVE_NEEDED,
        NO_VECTOR_FOUND,
    }

    /**
     * A single action in the sequence result from the simulator
     */
    export type MoveFirePart = {
        action: BaseAction
        target: Target
        ap: number
        possible: boolean
    }

    /**
     * A simulation result
     */
    export class MoveFireResult {
        // Simulation success, false only if no route can be found
        success = false
        // Ideal successive parts to make the full move+fire
        parts: MoveFirePart[] = []
        // Simulation complete (both move and fire are possible)
        complete = false

        need_move = false
        can_move = false
        can_end_move = false
        total_move_ap = 0
        move_location = new Target(0, 0, null)

        need_fire = false
        can_fire = false
        total_fire_ap = 0
        fire_location = new Target(0, 0, null)
    };

    /**
     * Utility to simulate a move+fire action.
     * 
     * This is also a helper to bring a ship in range to fire a weapon.
     */
    export class MoveFireSimulator {
        ship: Ship;

        constructor(ship: Ship) {
            this.ship = ship;
        }

        /**
         * Find the best available engine for moving
         */
        findBestEngine(): Equipment | null {
            let engines = this.ship.listEquipment(SlotType.Engine);
            if (engines.length == 0) {
                return null;
            } else {
                return maxBy(engines, engine => (engine.action instanceof MoveAction) ? engine.action.getDistanceByActionPoint(this.ship) : 0);
            }
        }

        /**
         * Check that a move action can reach a given destination
         */
        canMoveTo(action: MoveAction, target: Target): boolean {
            let checked = action.checkLocationTarget(this.ship, target);
            return checked != null && checked.x == target.x && checked.y == target.y;
        }

        /**
         * Get an iterator for scanning a circle
         */
        scanCircle(x: number, y: number, radius: number, nr = 6, na = 30): Iterator<Target> {
            let rcount = nr ? 1 / (nr - 1) : 0;
            return ichainit(imap(istep(0, irepeat(rcount, nr - 1)), r => {
                let angles = Math.max(1, Math.ceil(na * r));
                return imap(istep(0, irepeat(2 * Math.PI / angles, angles - 1)), a => {
                    return new Target(x + r * radius * Math.cos(a), y + r * radius * Math.sin(a))
                });
            }));
        }

        /**
         * Find the best approach location, to put a target in a given range.
         * 
         * Return null if no approach vector was found.
         */
        getApproach(action: MoveAction, target: Target, radius: number, margin = 0): Target | ApproachSimulationError {
            let dx = target.x - this.ship.arena_x;
            let dy = target.y - this.ship.arena_y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= radius) {
                return ApproachSimulationError.NO_MOVE_NEEDED;
            } else {
                if (margin && radius > margin) {
                    radius -= margin;
                }
                let factor = (distance - radius) / distance;
                let candidate = new Target(this.ship.arena_x + dx * factor, this.ship.arena_y + dy * factor);
                if (this.canMoveTo(action, candidate)) {
                    return candidate;
                } else {
                    let candidates: [number, Target][] = [];
                    iforeach(this.scanCircle(target.x, target.y, radius), candidate => {
                        if (this.canMoveTo(action, candidate)) {
                            candidates.push([candidate.getDistanceTo(this.ship.location), candidate]);
                        }
                    });

                    if (candidates.length) {
                        return minBy(candidates, ([distance, candidate]) => distance)[1];
                    } else {
                        return ApproachSimulationError.NO_VECTOR_FOUND;
                    }
                }
            }
        }

        /**
         * Simulate a given action on a given valid target.
         */
        simulateAction(action: BaseAction, target: Target, move_margin = 0): MoveFireResult {
            let result = new MoveFireResult();
            let ap = this.ship.getValue("power");

            // Move or approach needed ?
            let move_target: Target | null = null;
            result.move_location = Target.newFromShip(this.ship);
            if (action instanceof MoveAction) {
                let corrected_target = action.applyReachableRange(this.ship, target, move_margin);
                corrected_target = action.applyExclusion(this.ship, corrected_target);
                if (corrected_target) {
                    result.need_move = target.getDistanceTo(this.ship.location) > 0;
                    move_target = corrected_target;
                }
            } else {
                let engine = this.findBestEngine();
                if (engine && engine.action instanceof MoveAction) {
                    let approach_radius = action.getRangeRadius(this.ship);
                    let approach = this.getApproach(engine.action, target, approach_radius, move_margin);
                    if (approach instanceof Target) {
                        result.need_move = true;
                        move_target = approach;
                    } else if (approach != ApproachSimulationError.NO_MOVE_NEEDED) {
                        result.need_move = true;
                        result.can_move = false;
                        result.success = false;
                        return result;
                    }
                }
            }
            if (move_target && arenaDistance(move_target, this.ship.location) < 0.000001) {
                result.need_move = false;
            }

            // Check move AP
            if (result.need_move && move_target) {
                let engine = this.findBestEngine();
                if (engine && engine.action) {
                    result.total_move_ap = engine.action.getActionPointsUsage(this.ship, move_target);
                    result.can_move = ap > 0;
                    result.can_end_move = result.total_move_ap <= ap;
                    result.move_location = move_target;
                    // TODO Split in "this turn" part and "next turn" part if needed
                    result.parts.push({ action: engine.action, target: move_target, ap: result.total_move_ap, possible: result.can_move });

                    ap -= result.total_move_ap;
                }
            }

            // Check action AP
            if (action instanceof MoveAction) {
                result.success = result.need_move && result.can_move;
            } else {
                result.need_fire = true;
                result.total_fire_ap = action.getActionPointsUsage(this.ship, target);
                result.can_fire = result.total_fire_ap <= ap;
                result.fire_location = target;
                result.parts.push({ action: action, target: target, ap: result.total_fire_ap, possible: (!result.need_move || result.can_end_move) && result.can_fire });
                result.success = true;
            }

            result.complete = (!result.need_move || result.can_end_move) && (!result.need_fire || result.can_fire);

            return result;
        }
    }
}
